import * as d3 from "d3";
import d3tip from "d3-tip";
import irisData from "./data/irisData.js";


// auxiliary function to convert a data to a data array
const buildData = async function (data) {
  let array = []
  d3.range(data.length).map((d) => {
    const o = d3.range(data[0].length).map((t) => ({
      t: t,
      n: d,
      value: data[d][t]
    }))
    array = [...array, ...o]
  })
  return array
}

// trim label lengths if they are greater than 8 characters
function trimText(arr) {
  return arr.map(label => {
    const str = String(label);
    if (str.length > 12) {
      return str.slice(0, 12) + "...";
    }
    return str;
  });
}



export async function heatmap_plot(options = {}) {
  console.log("RUNNING heatmap_plot()----------------------");
 

  const {
    divid: divid = "",
    data: data = irisData.map(obj => Object.values(obj)).map(row => row.slice(0, -1)),
    rowNames: rowNames = irisData.map(obj => Object.values(obj)).map((d, idx) => d[4] + idx),
    colNames: colNames = Object.keys(irisData[0]).slice(0, -1),
    height: height = 900,
    width: width = 400,
    color: color = ['#000080', '#ffffff', '#d73027'], // navy (low) - white (middle) - red (high)//'#000080', //"#d62728",
    marginTop: marginTop = 0,
    marginBottom: marginBottom = 0,
    marginLeft: marginLeft = 0,
    marginRight: marginRight = 0,
    legendOffsetX: legendOffsetX = 0,

    colorScale: colorScale = null,
         // hover tooltip
        tooltip_decimal: tooltip_decimal = 2,
        tooltip_fontFamily: tooltip_fontFamily = 'monospace',
        tooltip_fontSize: tooltip_fontSize = '14px',

  } = options

  // start of heatmap
  const flatValues = data.flat().filter(v => Number.isFinite(v));
  let derivedScale = colorScale;
  if (!Array.isArray(derivedScale) || derivedScale.length !== 2 || !derivedScale.every(Number.isFinite)) {
    const extent = d3.extent(flatValues);
    if (extent[0] === extent[1]) {
      derivedScale = [extent[0] ?? 0, (extent[1] ?? 0) + 1];
    } else {
      derivedScale = extent;
    }
  }

  const midVal = (derivedScale[0] + derivedScale[1]) / 2;
  const color_scale = d3.scaleLinear()
    .domain([derivedScale[0], midVal, derivedScale[1]])
    .range(color) // navy (low) - white (middle) - red (high)

  // bottom labels: Calculate font size as half the heatmap cell width
  const cellWidth = (width - marginLeft - marginRight ) / data[0].length;
  const labelFontSizeBottom = Math.min(Math.max(cellWidth / 6, 8), 20); // clamp between 8px and 20px
  const maxColLabelLength = Math.min(d3.max(colNames.map(c => String(c).length)), 13);
  const dynamicBottomMargin = Math.max(marginBottom, labelFontSizeBottom * maxColLabelLength * 0.5  + 5);
  const cellHeight = (height - marginTop - dynamicBottomMargin) / data.length;
  const labelFontSizeRight = Math.min(Math.max(cellHeight / 3, 7), 20); // clamp between 7px and 20px
  const maxRowLabelLength = Math.min(d3.max(rowNames.map(r => String(r).length)), 13);
  const dynamicRightMargin = Math.max(200, labelFontSizeRight * maxRowLabelLength * 0.6 + 100);
  const margin = ({
    top: marginTop,
    bottom: dynamicBottomMargin,
    left: marginLeft,
    right: dynamicRightMargin
  });
  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.left - margin.right;

  // console.log("HEATMAP ###########################################")

  // console.log("height2:", height);
  // console.log("width2:", width);
  // console.log("color2:", color);
  // console.log("marginTop2:", marginTop);
  // console.log("marginBottom2:", marginBottom);
  // console.log("marginLeft2:", marginLeft);
  // console.log("marginRight2:", marginRight);
  // console.log("colorScale2:", colorScale);
  // console.log("cellWidth2-------:", cellWidth);
  //   console.log("cellHeight2:", cellHeight);
  // console.log("labelFontSizeBottom2:", labelFontSizeBottom);
  // console.log("maxColLabelLength2:", maxColLabelLength);
  // console.log("dynamicBottomMargin2:", dynamicBottomMargin);

  // console.log("labelFontSizeRight2:", labelFontSizeRight);
  // console.log("maxRowLabelLength2:", maxRowLabelLength);
  // console.log("dynamicRightMargin2:", dynamicRightMargin);
  // console.log("2: labelFontSizeBottom * maxColLabelLength * 0.5 + 5:", labelFontSizeBottom * maxColLabelLength * 0.5 + 5)
  // console.log("margin2:", margin);
  // console.log("innerHeight2:", innerHeight);
  // console.log("innerWidth2:", innerWidth);

  // Trim labels to 8 characters max (for display only)
  const trimmedColnames = trimText(colNames);
  const trimmedRownames = trimText(rowNames);

  // Use indices for scale domain to avoid duplicate label issues
  const colIndices = d3.range(data[0].length);
  const rowIndices = d3.range(data.length);

  let x_scale = d3.scaleBand()
    .domain(colIndices)
    .range([0, innerWidth])
    .padding(0)

  let y_scale = d3.scaleBand()
    .domain(rowIndices)
    .range([0, innerHeight])
    .padding(0)


  // index of the rows based on cluster hierarchy
  const svg = d3.create("svg");

  // Set SVG size 
  svg
    .attr('width', width)
    .attr('height', height);

  // Solid white background to ensure white behind dendrograms/heatmap
  svg.append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', width)
    .attr('height', height)
    .attr('fill', '#ffffff');


        // ...existing code...
  const g = svg
    .append('g')
    // move the entire graph down and right to accomodate labels
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  //create x axis plus text labels (at bottom of heatmap)
  const x_axis = g.append('g')
    .attr('transform', `translate(0, ${innerHeight})`)
    .call(d3.axisBottom(x_scale).tickFormat(i => trimmedColnames[i]))
    .style("font-size", labelFontSizeBottom + "px");


  x_axis.selectAll('.tick').selectAll('line').remove()
  x_axis.selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-2px")
    .attr("dy", "0.3em")
    .attr("class", "xa")
    .attr("transform", "rotate(-90)")
    .style("fill", "#000")

  //create y axis  plus text labels (at right of heatmap)
  let y_axis = g.append('g')
    .attr('transform', `translate( ${innerWidth},0)`)
    .call(d3.axisRight(y_scale).tickFormat(i => trimmedRownames[i]))
    .attr("id", "ya")
    .style("font-size", labelFontSizeRight + "px");

  y_axis.selectAll('.tick').selectAll('line').remove()
  y_axis.selectAll("text")
    .attr("dx", "3px")
    .attr("dy", "0.3em")
    .attr("class", "yaa")
    .style("text-anchor", "start")
    .style("fill", "#000")


  // interactive labels
  const tooltip = d3tip()
    .style('border', 'solid 3px black')
    .style('background-color', 'white')
    .style('color', '#000')
    .style('border-radius', '10px')
    .style('float', 'left')
    .style('font-family', tooltip_fontFamily)
    .style("font-size", tooltip_fontSize)
    .html((event, d) => `
        <div style='float: right; color: #000;'>
           val:${d.value.toFixed(tooltip_decimal)} <br/>
             row:${rowNames[d.n]}, col:${(colNames[d.t])} 
        </div>`)
  svg.call(tooltip)

  // create heatmap squares
  const heatMapData = await buildData(data)

  const gPoints = g.append("g").attr("class", "gPoints");


  function getHeatmapColor(v, color_scale) {
  if (v === -1 || !Number.isFinite(v)) return "#000000";
  return color_scale(v);
}

  gPoints.selectAll()
    .data(heatMapData)
    .enter()
    .append('rect')
    .attr('x', (d) => x_scale(d.t))
    .attr('y', (d) => y_scale(d.n))
    .attr('width', x_scale.bandwidth())
    .attr('height', y_scale.bandwidth())
    .attr('fill', (d) => getHeatmapColor(d.value, color_scale))
    // show the tooltip when "mouseover"
    .on('mouseover', tooltip.show)
    // Hide the tooltip when "mouseout"
    .on('mouseout', tooltip.hide)


     // Color legend on the right side (START)
    const legendWidth = 30;
    const legendHeight = Math.max(innerHeight / 2, 60); // Half the heatmap height, minimum 60px
    const legendX = innerWidth + margin.right/2 + legendOffsetX; // Position after right axis labels
    console.log("margin.right:", margin.right)
    // Move legend one fourth of the heatmap (inner) height down
    const legendY = innerHeight / 3;//0

    // Create 5 discrete color boxes
    const minVal = derivedScale[0];
    const maxVal = derivedScale[1];
    const range = maxVal - minVal;

    // Create gradient definition
    const gradientId = "legend-gradient-" + Math.random().toString(36).substr(2, 9);
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0%")
        .attr("y1", "100%") // bottom (low values)
        .attr("x2", "0%")
        .attr("y2", "0%"); // top (high values)

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", color[0]); // low

    gradient.append("stop")
        .attr("offset", "50%")
        .attr("stop-color", color[1]); // middle

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", color[2]); // high

    // Draw gradient rectangle
    g.append("rect")
        .attr("x", legendX)
        .attr("y", legendY)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", `url(#${gradientId})`)
        .style("stroke", "#000")
        .style("stroke-width", "1px");

    // Legend axis (scale for the values)
    const legendScale = d3.scaleLinear()
        .domain(derivedScale)
        .range([legendHeight, 0]);

    // Create 5 tick values for the legend
    const numBoxes = 5;
    const legendTickValues = [];
    for (let i = 0; i < numBoxes; i++) {
        legendTickValues.push(minVal + (i / (numBoxes - 1)) * range);
    }

    const legendAxis = d3.axisRight(legendScale)
        .tickValues(legendTickValues)
        .tickFormat(d3.format(".2f"));

    const legendAxisG = g.append("g")
        .attr("transform", `translate(${legendX + legendWidth}, ${legendY})`)
        .call(legendAxis)
        .style("font-size", "14px");

    // Ensure tick text is visible with black fill
    legendAxisG.selectAll("text")
        .style("fill", "#000");

    legendAxisG.selectAll("line")
        .style("stroke", "#000");

    legendAxisG.selectAll("path")
        .style("stroke", "#000");

        
// small black box labeled “Missing”:
g.append("rect")
  .attr("x", legendX)
  .attr("y", legendY + legendHeight + 20)
  .attr("width", 15)
  .attr("height", 15)
  .attr("fill", "#000000");

g.append("text")
  .attr("x", legendX + 20)
  .attr("y", legendY + legendHeight + 32)
  .text("Missing")
  .style("font-size", "12px")
  .style("fill", "#000");

    // Color legend on the right side (END)
// END HEATMAP #########################################


  // Here we add the svg to the plot div
  // Check if the div was provided in the function call
  if (document.getElementById(divid)) {
    console.log(`plot div provided in function parameters.divid:`, divid);
    const div = document.getElementById(divid)
    div.innerHTML = ""
    div.appendChild(svg.node())

  } else if (!document.getElementById("childDiv")) {
    // console.log(`pcaPlot div  NOT provided in function parameters or doesn't exist, creating div....`);
    const div = document.createElement("div")
    document.body.appendChild(div)
    div.appendChild(svg.node());
  }


  return svg.node()
}
