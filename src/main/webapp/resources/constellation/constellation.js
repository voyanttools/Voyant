import * as vec from "./vec_math.js";
import * as chart from "./chart.js";

export let update_selection_list = chart.update_selection_list;
export let init_graph = chart.init_graph;


export function insert_node(id, label, vector, chart_data) {
  /**
   * Inserts a new node into the visualization.
   * id - Unique id for the node
   * label - The visible name for the node.
   * vector - An array indicating the vector.
   * chart_data - Chart data object to append new node to.
   */

  // First test to see if the node already exists.
  const node = vec.get_from_array(id, chart_data.nodes);
  if (node !== false) {
    return node;
  }

  let custom_node = {
      id: id,
      label: label,
      vector: vector,
      alt: [],
      inserted: true
    }

  for (let node of chart_data.nodes) {
    let edge = {
      "source": custom_node,
      "target": node,
      "sim": chart_data.metric(custom_node.vector, node.vector),
    }
    chart_data.edges.push(edge);
  }

  chart_data.edges.sort((x, y) => {
    return x.sim - y.sim
  });

  chart_data.nodes.push(custom_node);
  return custom_node;
}



export function update_graph(chart_data, restart=true) {
  /**
   * Update the graph given the chart_data object.
   * restart - If true, restart the simulation after update.
   */


  // Update node list
  chart.update_datalist(chart_data.nodes)

  // Update selection attribute on all nodes.
  for (let node of chart_data.nodes) {
    node.selected = chart_data.selection.has(node.id);
  }

  // Find all edges that exist between the cutoffs.
  let edges_filtered = chart_data.edges.slice(0, chart_data.cutoff);

  // Create the initial list of nodes that are a part of the above edges.
  let nodes_counter = {};
  let selection_connection = new Set();
  edges_filtered.forEach(edge => {

    // If the node is connected to a selected node, save it for later.
    if (edge.source.selected || edge.target.selected) {
      selection_connection.add(edge.source.id);
      selection_connection.add(edge.target.id);
    }

    nodes_counter[edge.source.id] = (nodes_counter[edge.source.id] || 0) + 1
    nodes_counter[edge.target.id] = (nodes_counter[edge.target.id] || 0) + 1
  })

  // Prune list of nodes based on selection criteria.
  let nodes_filtered = chart_data.nodes.filter(node => {
    // Keep all selected nodes
    if (node.selected) {
      return true
    }

    // Prune nodes that don't have edges
    if (!nodes_counter.hasOwnProperty(node.id)) {
      return false
    }

    // Prune nodes less with connections less than cut off.
    if (nodes_counter[node.id] > chart_data.connections) {
      return false;
    }

    if (chart_data.hide_unselected) {
      if (!selection_connection.has(node.id)) {
        return false;
      }
    }

    return true
  })

  // Finally, remove any edges that aren't connected to show nodes.
  edges_filtered = edges_filtered.filter(edge => {
    if (nodes_filtered.includes(edge.source)) {
      if (nodes_filtered.includes(edge.target)) {
        return true;
      }
    }
    return false;
  });

  chart.create_graph(chart_data, edges_filtered, nodes_filtered, chart_data.hidden, restart, update_selection)
}

function create_edge(x, y, metric) {
  let sim = metric(x["vector"], y["vector"])
  return {
    "source": x,
    "target": y,
    "sim": sim
  }
}


export function generate_edges(nodes, metric) {
  /**
   * Initial generation of edges
   * nodes - List of nodes to create edges for.
   * metric - The metric to use for edge generation.
   */

  console.log("generating edges");

  let edges = [];

  for (let pairs of vec.combinations(nodes)) {
    let [source, target] = pairs;
    edges.push(create_edge(source, target, metric));
  }

  edges.sort((x, y) => {
    return x.sim - y.sim
  });

  console.log("done generating edges")

  return edges;
}

export function update_selection(chart_data) {
  let fun_unselect = function(event) {
    const id = event.target.getAttribute("data-id");
    chart_data.selection.delete(id);
    update_selection(chart_data)
  }

  update_selection_list(chart_data.selection, fun_unselect)
  update_graph(chart_data, false);
}

