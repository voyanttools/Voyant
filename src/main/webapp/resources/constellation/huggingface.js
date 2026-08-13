import { pipeline, cos_sim } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.0.0-next.7"

let model = undefined;
const model_name = "jinaai/jina-embeddings-v2-base-code"


export async function load_browser_model() {
  console.log("start load");
  try {
    model = await pipeline("feature-extraction", model_name);
    console.log("end load");
    return true
  } catch (e) {
    model = undefined
    console.log("failed to load model");
    console.log(e);
    return false
  }
}

export function hg_cos_sim(x, y) {
  const sim = cos_sim(x, y);
  return (sim * -1) + 1
}

export function submit(words) {
  if (model === undefined) {
    return false;
  }

  return model(words, {
    pooling: "mean",
    normalize: true,
  })
}



export async function populate_data(words) {
  const embeddings = await submit(words);

  let nodes = [];

  words.forEach((word, index) => {
    nodes.push({
      id: word,
      label: word,
      vector: embeddings[index].data,
    })
  });

  return nodes;
}
