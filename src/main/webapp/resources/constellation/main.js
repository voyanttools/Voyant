import * as constellation from "./constellation.js"
import * as vec from "./vec_math.js"
import * as hg from "./huggingface.js"

Voyant.panel.Constellation.constellation = constellation;
Voyant.panel.Constellation.vec = vec;
Voyant.application.dispatchEvent('constellationJSLoaded', Voyant.panel.Constellation);


function parse_selection(selection, chart_data) {
  // Return early if the node already exists.
  let current = vec.get_from_array(selection, chart_data.nodes);
  if (current !== false) {
    return current
  }

  let values = selection.split(" ");

  let temp = null;
  let next = vec.add;

  for (let x of values) {
    let row = vec.get_from_array(x, chart_data.nodes).vector

    if (x === "+") {
      next = vec.add
    } else if (x === "-") {
      next = vec.subtract
    } else if (row !== undefined) {
      temp = next(temp, row)
    } else {
      console.log("unknown word", x)
    }
  }

  // Return early if selection is invalid.
  if (temp === null) {
    return false
  }

  return constellation.insert_node(selection, selection, temp, chart_data)
}



async function load_hg_data(data) {
  let result = await hg.load_browser_model()
  if (result) {
    return await hg.populate_data(data.map(x => x.term));
  }
  return []
}


async function main(data, type) {

  let metric = hg.hg_cos_sim;


  let nodes;
  if (type === "test") {
    nodes = data.map(x => {return {
        id: x["term"],
        label: x["term"],
        vector: x["vector"],
      }});
  } else if (type === "hg") {
    nodes = await load_hg_data(data);
  } else {
    nodes = [];
  }

  let edges = constellation.generate_edges(nodes, metric);

  let loader = document.getElementById("loader")
  loader.classList.add("hidden");

  document.getElementById("controls").classList.remove("hidden");
  let element = document.getElementById("wrapper");


  // Initialize graph
  // Note: edges need references to the exact object. Note just the term
  let [svg, simulation, zoom] = constellation.init_graph(element.offsetWidth, element.offsetHeight);

  let chart_data = {
    svg: svg,
    simulation: simulation,
    metric: metric,
    //metric: document.getElementById("metric").value === "Euclid" ? vec.distance : vec.cosine_similarity,
    cutoff: parseFloat(document.getElementById("strength").value),
    connections: parseFloat(document.getElementById("connections").value),
    hidden: document.getElementById("hidetext").checked,
    hide_unselected: document.getElementById("hide-unselected").checked,
    selection: new Set(),
    nodes: nodes,
    edges: edges,
  }

  constellation.update_graph(chart_data);

  // Initialize events
  document.getElementById("wrapper").append(chart_data.svg.node());

  document.getElementById("reset").addEventListener("click", () => {
    svg.call(zoom.transform, d3.zoomIdentity);
  });

  // Build event listeners for controls
  document.getElementById("strength").addEventListener("input", function(event) {
    chart_data.cutoff = parseFloat(event.target.value);
    constellation.update_graph(chart_data);
  });

  document.getElementById("connections").addEventListener("input", function(event) {
    chart_data.connections = parseFloat(event.target.value);
    constellation.update_graph(chart_data);
  });

  document.getElementById("link-strength").addEventListener("input", function(event) {
    let strength = parseFloat(event.target.value);
    chart_data.simulation.force("link").distance(x => x.sim * strength);
    chart_data.simulation.alpha(1).restart();
  });

  document.getElementById("body-strength").addEventListener("input", function(event) {
    let strength= parseFloat(event.target.value);
    chart_data.simulation.force("body").strength(strength);
    chart_data.simulation.alpha(1).restart();
  });

  document.getElementById("selection").addEventListener("change", function(event) {
    const selection = event.target.value.trim();

    let node = parse_selection(selection, chart_data);
    chart_data.selection.add(node.id)
    constellation.update_selection(chart_data)
  });

  document.getElementById("hidetext").addEventListener("change", function(event) {
    chart_data.hidden = event.target.checked;
    constellation.update_graph(chart_data, false)
  });

  document.getElementById("hide-unselected").addEventListener("change", function(event) {
    chart_data.hide_unselected = event.target.checked;
    constellation.update_graph(chart_data);
    document.getElementById("reset").click();
  });

  document.getElementById("metric").addEventListener("change", function(event) {
    chart_data.metric = event.target.value === "Euclid" ? vec.distance : hg.hg_cos_sim;
    chart_data.edges = constellation.generate_edges(chart_data.nodes, chart_data.metric)
    constellation.update_graph(chart_data);
  });

  document.getElementById("active").addEventListener("change", function(event) {
    if (event.target.checked) {
      chart_data.simulation.alpha(0.2).alphaDecay(0);
    } else {
      chart_data.simulation.alphaDecay(0.0228);
    }

    chart_data.simulation.restart();
  });

  document.getElementById("fulltext").addEventListener("change", async function(event) {
    const embeddings = await hg.submit([event.target.value]);
    if (embeddings === false) {
      return
    }

    const vector = embeddings[0].data
    // const vector = [0.4, 0.5, 0.2]
    const fulltext = event.target.value.trim()

    let new_node = constellation.insert_node(fulltext, fulltext, vector, chart_data);
    chart_data.selection.add(new_node.id)
    constellation.update_selection(chart_data)
  });
}


window.onload = function() {
  fetch("analysis.json").then(x => x.json()).then(data => main(data, "hg"))
}
