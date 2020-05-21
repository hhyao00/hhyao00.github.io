
var svg_heat;
var margin_heat;
var width_heat;
var height_heat;

var x_heat;
var y_heat;

function init_heatmap(){

    margin_heat = { top: 0, right: 20, bottom: 10, left: 50 },
    width_heat = 950 - margin_heat.left - margin_heat.right,
    height_heat = 230 - margin_heat.top - margin_heat.bottom;


        // append the svg object to the body of the page
        svg_heat = d3.select("#heatmap")
        .append("svg")
        //   .attr("width", width + margin.left + margin.right)
        //   .attr("height", height + margin.top + margin.bottom)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 950 250")
        .append("g")
        .attr("transform",
            "translate(" + margin_heat.left + "," + margin_heat.top + ")");
}


function heatmap(value1, init){

    // d3.select('#heatmap').selectAll('svg').remove()

    // append the svg object to the body of the page
    // var svg = d3.select("#heatmap")
    //     .append("svg")
    //     //   .attr("width", width + margin.left + margin.right)
    //     //   .attr("height", height + margin.top + margin.bottom)
    //     .attr("preserveAspectRatio", "xMinYMin meet")
    //     .attr("viewBox", "0 0 950 250")
    //     .append("g")
    //     .attr("transform",
    //         "translate(" + margin.left + "," + margin.top + ")");

    var svg = svg_heat;
    var margin = margin_heat;
    var width = width_heat;
    var height = height_heat;
    
    //Read the data
    d3.csv("https://raw.githubusercontent.com/hhyao00/datasets/master/heatmap_"+value1+".csv", function (data) {
        https://raw.githubusercontent.com/hhyao00/datasets/master/heatmap_bigram.csv
        // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
        var myGroups = d3.map(data, function (d) { return d.group; }).keys()
        var myVars = d3.map(data, function (d) { return d.variable; }).keys()

       if (init) {
        // Build X scales and axis:
        x_heat = d3.scaleBand()
            .range([0, width])
            .domain(myGroups)
            .padding(0.005);
        svg_heat.append("g")
            .style("font-size", 7)
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x_heat).tickSize(0))
            .select(".domain").remove()

        // Build Y scales and axis:
        y_heat = d3.scaleBand()
            .range([height, 0])
            .domain(myVars)
            .padding(0.05);
        svg_heat.append("g")
            .style("font-size", 7)
            .call(d3.axisLeft(y_heat).tickSize(0))
            .select(".domain").remove()
       }
        var x = x_heat;
        var y = y_heat;
    
        

        // Build color scale
        var myColor = d3.scaleSequential()
            .interpolator(d3.interpolatePuBu)
            .domain([d3.min(data, function (d){
                return d.value;
            }), 1])
        
        svg.selectAll('rect').style("fill",'white').transition().duration(20).style('opacity', 0).remove()
        svg.selectAll('#domains').remove()

        // add the squares
        svg.selectAll()
            .data(data, function (d) { return d.group + ':' + d.variable; })
            .enter()
            .append("rect")
            .style("opacity",0.4)
            .attr("x", function (d) { return x(d.group) })
            .attr("y", function (d) { return y(d.variable) })
            // .transition()
            .attr("rx", 1.5)
            .attr("ry", 1.5)
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .attr("id", function (d) { return 'heatmap'+d.variable })
            // .transition().duration(150)
            .style("fill", function (d) { return myColor(d.value) })
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 0.8)
            .on("mouseover", function (d) {
                d3.select(this)
                    .style('opacity', 0.8)
                    .style("fill", '#fce4bd')
                tooltip.style("visibility", "visible")
                    .style("top", d3.event.pageY - 70 + "px")
                    .style("left", d3.event.pageX - 55 + "px")
                tooltip.html('<strong><font size=2>' + d.group +':'+d.variable + "</font></strong>" +
                    "<br><font size=1>- cosine similarity: " + d.value + "</font>"+
                    "<br><font size=1>- p-value: " + d.pval + "</font>")
            })
            .on("mouseout", function (d) {
                d3.select(this)
                    .style("opacity", 0.8)
                    .style('fill', function (d) { return myColor(d.value) })
                tooltip.style("visibility", "hidden");
            })
            .filter(function (d) {
                var ypos = y(d.variable);
                var xpos = x(d.group);
                return xpos <= ypos;
            })

        var labels = svg.append('g')
        labels
            .selectAll("text")
            .data(data)
            .enter()
            .filter(function (d) {
                var ypos = y(d.variable);
                var xpos = y(d.group);
                return xpos <= ypos;
            })
            .append("text")
            .attr("x", function (d) { return x(d.group); })
            .attr("y", function (d) { return y(d.variable); })
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .attr('dx',x.bandwidth()/2)
            .attr('dy',y.bandwidth()/1.5)
            .attr("font-family", "courier")
            .attr("font-size", '8px')
            .attr('font-weight','bold')
            .attr("fill", "white")
            .attr('id','domains')
            .text(function (d) { return d.value; });

    })

    // Add title to graph
    // svg.append("text")
    //         .attr("x", 0)
    //         .attr("y", -50)
    //         .attr("text-anchor", "left")
    //         .style("font-size", "22px")
    //         .text("A d3.js heatmap");

    // // Add subtitle to graph
    // svg.append("text")
    //         .attr("x", 0)
    //         .attr("y", -20)
    //         .attr("text-anchor", "left")
    //         .style("font-size", "14px")
    //         .style("fill", "grey")
    //         .style("max-width", 400)
    //         .text("A short description of the take-away message of this chart.");


}