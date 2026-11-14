export class Provider {
  constructor(config, override) {
    if (override === undefined) {
      override = {}
    }



    this.label = override.label || config.label;
    this.url = override.url || config.url;
    this.model = override.model || config.model;
    this.needs_key = override.key || config.key;
    this.api = override.api || config.api

    let system = override.system || config.system || "You are a helpful assistant"
    this.messages = [
      {"role": "system", "content": system}
    ]

    // Only used for huggingface models.
    this.pipeline = undefined
  }

  async chat(message, config) {
    if (config === undefined) {
      config = {}
    }

    // Update messages
    this.messages.push(
      {"role": "user", "content": message}
    )

    console.log("running chat")

    let return_message;
    if (this.api === 'openai') {
      return_message = await this.open_ai_chat(message, config);
    } else if (this.api === "huggingface") {
      return_message = await this.hugging_face_chat(message, config);
    } else {
      throw new Error("Unknown api type")
    }

    console.log("got message");
    console.log(return_message)

    this.messages.push(return_message);
    return return_message.content;

  }

  async hugging_face_chat(message, config) {
    if (this.pipeline === undefined) {
      this.pipeline = await transformers.pipeline(
        "text-generation",
        this.model
      )
    }

    const output = await this.pipeline(this.messages, config);
    return output[0].generated_text.at(-1);
  }


  async open_ai_chat(message, config) {
    console.log("running open ai chat")

    const body = {
      model: this.model,
      messages: this.messages,
      stream: false,
      max_tokens: config.max_tokens | 600,
      temperature: config.temperature | 0.4
    }

    let headers = {
        'Content-Type': 'application/json'
    }

    if (this.needs_key) {
      let key = await this.get_api_key();
      headers["Authorization"] = 'Bearer ' + key
    }

    console.log("about to run")

    const results = await fetch(this.url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    })

    console.log("done running")

    if (results.status === 401) {
      return "Invalid api key."
    } else if (results.status !== 200) {
      console.log(results)
      return `Server returned status code ${results.status}`
    }

    const output = await results.json();

    console.log("about to return");
    console.log(output.message)

    return output.message;
  }

  get_api_key(force=false) {
    const storage_name = "spyral-llm-keys"

    // Get entry from local storage
    let storage = localStorage.getItem(storage_name);
    if (storage === null) {
      storage = {};
    } else {
      storage = JSON.parse(storage);
    }

    // Return key if we already have it.
    if (!force && storage.hasOwnProperty(this.url)) {
      return storage[this.url];
    }

    // Get key from user if we don't.
    const message = `${this.label} needs your API key. This key is kept in this browser only and never sent to the Voyant servers.`
    const key = window.prompt(message).trim()

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
  'huggingface': {
    'label': 'HuggingFace',
    'url': undefined,
    'model': 'HuggingFaceTB/SmolLM2-360M-Instruct',
    'api': 'huggingface',
    'key': false
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
  'openai': new Provider(LLM_CONFIG.openai),
  'gemini': new Provider(LLM_CONFIG.gemini),
  // Ollama Cloud doesn't work due to CORS  issues.
  // 'ollama_cloud': new Provider("Ollama Cloud", "https://ollama.com", "qwen3.5"),
  "ollama": new Provider(LLM_CONFIG.ollama),
  "huggingface": new Provider(LLM_CONFIG.huggingface),
  "vulcan": new Provider(LLM_CONFIG.vulcan),
};
