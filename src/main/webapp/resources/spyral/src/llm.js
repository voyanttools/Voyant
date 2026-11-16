import * as transformers from "../../transformers/transformers-4-3-2";

export class Provider {
  constructor(config, override) {
    if (override === undefined) {
      override = {}
    }

    this.label = override.label ?? config.label;
    this.url = override.url ?? config.url;
    this.model = override.model ?? config.model;
    this.needs_key = override.key ?? config.key;
    this.api = override.api ?? config.api
    this.system = override.system ?? config.system ?? "You are a helpful assistant"
    this.messages = []

    // Only used for huggingface models.
    this.pipeline = undefined

    let functions = {
      "openai": this.open_ai_chat,
      "anthropic": this.anthropic_chat,
      "huggingface": this.hugging_face_chat
    }

    if (functions[this.api] === undefined) {
      throw new Error(`Unknown api type: ${this.api}`)
    }

    this.function = functions[this.api].bind(this)
  }

  async check_response(results) {
    if (results.ok) {
      return
    }

    if (results.status === 401) {
      // 401 Unauthorized. Key is bad
      this.reset_api_key()
    }

    let body = await results.json()

    if ((results.status === 400) && this.label === "Gemini") {
      // Gemini returns 400 for a bad api key. We have to check for this sadly.
      const error_array = Array.isArray(body) ? body[0] : ""
      const error_message = error_array?.error?.message ?? ""
      if (error_message.toLowerCase().indexOf("api key") !== -1) {
        this.reset_api_key()
      }
    }

    throw new Error(JSON.stringify({
      status: results.status,
      body: body,
    }))
  }

  async chat(message, config) {
    if (config === undefined) {
      config = {}
    }

    // Update messages
    this.messages.push(
      {"role": "user", "content": message}
    )

    let return_message, warning
    try {
      [return_message, warning] = await this.function(config)
    } catch (e) {
      this.messages.pop();
      throw e;
    }

    if (return_message.content && return_message.content.trim()) {
      this.messages.push(return_message)
    } else {
      this.messages.pop()
    }

    if (warning) {
      return return_message + "\n\n" + warning
    }

    return return_message
  }

  async hugging_face_chat(config) {
    if (this.pipeline === undefined) {
      this.pipeline = await transformers.pipeline(
        "text-generation",
        this.model
      )
    }

    let messages = [{"role": "system", "content": this.system}, ...this.messages]

    const output = await this.pipeline(messages, config);
    // Hugging face returns the entire conversation up to this point. So we only want the latest entry.
    return [output[0].generated_text.at(-1), ""];
  }

  async open_ai_chat(config) {
    let messages = [{"role": "system", "content": this.system}, ...this.messages]

    const body = {
      ...config,
      model: this.model,
      messages: messages,
      stream: false,
    }

    let headers = {
        'Content-Type': 'application/json'
    }

    if (this.needs_key) {
      let key = await this.get_api_key();
      headers["Authorization"] = 'Bearer ' + key
    }

    const results = await fetch(this.url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    })

    await this.check_response(results)

    let output = await results.json();

    if (output.hasOwnProperty('choices')) {
      // Gemini sends back a unique object
      output = output.choices[0]
    }

    return [output.message, ""];
  }

  async anthropic_chat(config) {
    const body = {
      max_tokens: 600,
      ...config,
      model: this.model,
      messages: this.messages,
      system: this.system,
    }

    let headers = {
      'Content-Type': 'application/json',
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    }

    if (this.needs_key) {
      headers["x-api-key"] = await this.get_api_key()
    }

    const results = await fetch(this.url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    })

    await this.check_response(results)

    let output = await results.json();

    let warning = "";
    if (output.stop_reason === "refusal") {
      warning = "[Request declined by the model's safety system.]"
    } else if (output.stop_reason === "max_tokens") {
      warning = "[truncated]"
    } else if (output.stop_reason === "model_context_window_exceeded") {
      warning = "[Model context window exceeded]"
    } else if (output.stop_reason !== "end_turn") {
      warning = "[Claude is requesting advanced features that are not currently supported]"
    }

    let returned_text = output.content
      .filter(obj => obj.type === "text")
      .map(obj => obj.text)
      .join("\n")
      .trim();

    return [{"role": output.role, "content": returned_text}, warning]
  }

  reset_api_key() {
    const storage_name = "spyral-llm-keys"
    let storage = localStorage.getItem(storage_name);
    // No key is stored, so there is nothing to delete.
    if (storage === null) {
      return
    }

    storage = JSON.parse(storage)
    delete storage[this.url]
    localStorage.setItem(storage_name, JSON.stringify(storage))
  }

  get_api_key() {
    const storage_name = "spyral-llm-keys"

    // Get entry from local storage
    let storage = localStorage.getItem(storage_name);
    if (storage === null) {
      storage = {};
    } else {
      storage = JSON.parse(storage);
    }

    // Return key if we already have it.
    if (storage.hasOwnProperty(this.url)) {
      return storage[this.url];
    }

    // Get key from user if we don't have it.
    const message = `${this.label} needs your API key. This key is kept in this browser only and never sent to the Voyant servers.`

    const user_input = window.prompt(message);
    if (user_input === null || user_input.trim() === "") {
      throw new Error("API key is required.")
    }

    const key = user_input.trim()

    // Save key back to local storage
    storage[this.url] = key;
    localStorage.setItem(storage_name, JSON.stringify(storage))

    return key;
  }
}

export let LLM_CONFIG = {
  'openai': {
    'label': 'Openai',
    'url': 'https://api.openai.com/v1/chat/completions',
    'model': 'gpt-4o-mini',
    'api': 'openai',
    'key': true
  },
  'gemini': {
    'label': 'Gemini',
    'url': 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    'model': 'gemini-3.5-flash',
    'api': 'openai',
    'key': true
  },
  'ollama': {
    'label': 'Ollama Local',
    'url': 'http://localhost:11434/api/chat',
    'model': 'qwen3',
    'api': 'openai',
    'key': false
  },
  'ollama_cloud': {
    'label': 'Ollama Cloud',
    'url': 'https://ollama.com/api/chat',
    'model': 'qwen3.5',
    'api': 'openai',
    'key': true
  },
  'huggingface': {
    'label': 'HuggingFace',
    'url': undefined,
    'model': 'HuggingFaceTB/SmolLM2-360M-Instruct',
    'api': 'huggingface',
    'key': false
  },
  'claude': {
    'label': 'Claude',
    'url': "https://api.anthropic.com/v1/messages",
    'model': 'claude-sonnet-5-5',
    'api': 'anthropic',
    'key': true
  },
  'vulcan': {
    'label': 'Vulcan',
    'url': 'https://experimentalvoyanttools.ca/llm/v1/chat/completions',
    'model': 'meta-llama/Llama-3.3-70B-Instruct',
    'api': 'openai',
    'key': true
  }
}

export let LLM = {
  // "openai": new Provider(LLM_CONFIG.openai), // Cross-origin blocked.
  // "ollama_cloud": new Provider(LLM_CONFIG.ollama_cloud), // Cross-origin blocked.
  // "vulcan": new Provider(LLM_CONFIG.vulcan),
  "gemini": new Provider(LLM_CONFIG.gemini),
  "ollama": new Provider(LLM_CONFIG.ollama),
  "huggingface": new Provider(LLM_CONFIG.huggingface),
  "claude": new Provider(LLM_CONFIG.claude)
};
