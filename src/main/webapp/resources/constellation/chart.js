function ticked(svg) {
   svg.select("#links")
      .selectAll("line")
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    svg.select("#nodes")
      .selectAll("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    svg.select("#labels")
      .selectAll("text")
      .attr("x", d => d.x + 15)
      .attr("y", d => d.y + 5);
}

function dragstart(e, simulation) {
  // Reheat the simulation when drag starts, and fix the subject position.
  simulation.alphaTarget(0.3).restart()
  // Fix the subjects position so that the simulation no longer controls it.
  e.subject.fx = e.subject.x;
  e.subject.fy = e.subject.y;
}

function dragend(event, simulation) {
  // Restore the target alpha so the simulation cools after dragging ends.
  simulation.alphaTarget(0);
  // Unfix the subject position now that it’s no longer being dragged.
  event.subject.fx = null;
  event.subject.fy = null;
}

function dragdrag(event) {
   // The fx attribute fixes the element so the simulation no longer controls it
  event.subject.fx = event.x;
  event.subject.fy = event.y;
}

export function init_graph(width, height, graphId) {

  let nodes = [];
  let edges = [];

  const svg = d3.select("#"+graphId);

  const group = svg.append("g")
  function zoomed(e) {
    group.attr("transform", e.transform)
  }

  let zoom = d3.zoom().on("zoom", zoomed)

  svg.call(zoom);

  // document.getElementById("reset").addEventListener("click", () => svg.call(zoom.transform, d3.zoomIdentity));

  group.append("g").attr("id", "links")
  group.append("g").attr("id", "nodes")
  group.append("g").attr("id", "labels")

  let simulation = d3.forceSimulation(nodes)
    .force("x", d3.forceX(height / 2)) // Pushes circles towards the middle
    .force("y", d3.forceY(width / 2)) // Same as above
    .force("link", d3.forceLink(edges)
                     .id(d => d.id)
                     .distance(d => d.sim * 100)
                     .strength(1)) // Creates links and forces linked elements together
    .force("body", d3.forceManyBody()
                     .strength(-500)) // Keeps circles apart if they are not linked
    .force("center", d3.forceCenter(width / 2, height / 2)) // Forces viewport towards center
    .on("tick", () => ticked(svg))

  return [svg, simulation]
}

export function update_datalist(words) {
  d3.select("#words")
    .selectAll("option")
    .data(words)
    .join("option")
    .attr("value", x => x.id)
}

export function update_selection_list(data, fun_unselect) {
  d3.select("#selected-nodes")
    .selectAll("div.selection")
    .data(data, x => x)
    .join(
      enter => {
        let div = enter.append("div").classed("selection", true)
        div.append("div").text(x => x);
        div.append("button")
          .attr("data-id", x => x)
          .on("click", fun_unselect)
          .text("-");
      },
      update => update,
      exit => exit.remove()
    )
}

export function create_graph(chart_data, links, nodes, hidden=false, restart=true) {

  let svg = chart_data.svg;
  let simulation = chart_data.simulation;

  // Add label for each node
  svg.select("#labels")
    .selectAll("text")
    .data(nodes)
    .join("text")
      .classed("hidden", hidden)
      .classed("label", true)
      .text(d => d.label);

  // Add circle for each node
  svg.select("#nodes")
    .selectAll("circle")
    .data(nodes, d => d.id)
    .join("circle")
      .classed("node", true)
      .classed("selected", node => node.selected === true)
      .attr("r", node => {
        if (node.selected === true) {
          return 30
        }
        return 10
      })
      .on("click", (event) => {
        svg.dispatch('nodeClicked', {detail: {nodeId: event.target.__data__.id}});
      })
      .call(d3.drag()
        .on("start", e => dragstart(e, simulation))
        .on("drag", dragdrag)
        .on("end", e => dragend(e, simulation))
      );

  // Add line for each link
  svg.select("#links")
    .selectAll("line")
    .data(links)
    .join("line")
      .classed("link", true);

  simulation
    .nodes(nodes)
    .force("link")
      .links(links)

  if (restart) {
    simulation.alpha(1).restart()
  }
}

