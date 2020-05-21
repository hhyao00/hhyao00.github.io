
var margin_scatter;
var svg_scatter;

var width_scatter;
var height_scatter;

var zoom;

function init_scatter() {
    // set the dimensions and margins of the graph
    margin_scatter = { top: 0, right: 20, bottom: 10, left: 30 },
        width_scatter = 955 - margin_scatter.left - margin_scatter.right,
        height_scatter = 290 - margin_scatter.top - margin_scatter.bottom;


    // append the svg object to the body of the page
    svg_scatter = d3.select("#scatter")
        .append("svg")
        //   .attr("width", width + margin.left + margin.right)
        //   .attr("height", height + margin.top + margin.bottom)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 955 330")
        .append("g")
        .attr("pointer-events", "all")
        .attr("transform",
            "translate(" + margin_scatter.left + "," + margin_scatter.top + ")")
        
        

}

function scatter(dataset, init) {

    var svg = svg_scatter;
    var margin = margin_scatter;
    var width = width_scatter;
    var height = height_scatter;

    //Read the data
    d3.csv("https://raw.githubusercontent.com/hhyao00/datasets/master/scatter_" + dataset + ".csv", function (data) {

        // if (!init) {
        //     d3.select('#scatter').select('svg').remove();
        // }

        // append the svg object to the body of the page
        // var svg = d3.select("#scatter")
        //     .append("svg")
        //     //   .attr("width", width + margin.left + margin.right)
        //     //   .attr("height", height + margin.top + margin.bottom)
        //     .attr("preserveAspectRatio", "xMinYMin meet")
        //     .attr("viewBox", "0 0 950 350")
        //     .append("g")
        //     .attr("transform",
        //         "translate(" + margin.left + "," + margin.top + ")");

        var zoom = d3.zoom()
        .scaleExtent([1, 4])  // This control how much you can unzoom (x0.5) and zoom (x20)
        .extent([[0, 0], [width_scatter, height_scatter]])
        .on("zoom", zoomed);

        svg_scatter.style("pointer-events", "all").call(zoom);

        svg.selectAll('#axis').remove()
        // Add X axis
        var x = d3.scaleLinear()
            .domain([d3.min(data, function (d) { return +d.xval; }) - 1,
            d3.max(data, function (d) { return +d.xval; }) + 10])
            .range([0, width]);
        xAxis = svg.append("g").attr("id", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([d3.min(data, function (d) { return +d.yval; }) - 3,
            d3.max(data, function (d) { return +d.yval; }) + 3])
            .range([height, 0]);
        yAxis = svg.append("g").attr("id", "axis")
            .call(d3.axisLeft(y));


        // SORRY HARD CODING BECAUSE I'VE HAD SO MUCH WORK THESE PAST THREE WEEKS
        var color = d3.scaleOrdinal()
            .domain(['addiction', 'adhd', 'alcoholism', 'anger', 'anxiety',
                'eating_disorder', 'bipolar', 'bpd', 'ptsd', 'depression', 'dpdr',
                'drug_addiction', 'ocd', 'schizophrenia',
                'suicidality']) // 'panic', 'psychosis',
            .range([
                '#a6cee3',
                '#1f78b4',
                '#b2df8a',
                '#33a02c',
                '#fb9a99',
                '#e31a1c',
                '#fdbf6f',
                '#ff7f00',
                '#cab2d6',
                // '#6a3d9a',
                // '#ffff99',
                // '#b15928',
                '#8dd3c7',
                // '#ffffb3',
                '#bebada',
                '#fb8072',
                '#80b1d3',
                '#fdb462',
                '#b3de69',
                //    '#fccde5',
                // '#d9d9d9',
                // '#bc80bd',
                // '#ccebc5',
                '#957ba6',
                '#d9abbe',
                '#ffed6f']);

        svg.selectAll('.dot').style("fill", 'white').transition().duration(20).style('opacity', 0).remove()
        svg.selectAll('#domains').remove()

        var mouseover = function (d) {

            tooltip.style("visibility", "visible")
                .style("top", d3.event.pageY +20 + "px")
                .style("left", d3.event.pageX - 220 + "px")
            tooltip.html(d.LABEL + '<div id=spantext><p><font size=1>' + d.TEXT + '</font></p></div>')

            selected_specie = d.LABEL
            d3.selectAll(".dot")
                .style('opacity', 0.20)

            d3.selectAll('#' + d.LABEL)
                // .attr('r', 4)
                .style('opacity', 1)

                d3.select(this)
                .transition()
                .duration(150)
                .attr('r', 7)
                .style('opacity', 1)
                .style('stroke-width',3)
                .style('stroke','white')

        }

        var mouseleave = function (d) {
            tooltip.style("visibility", "hidden")

            d3.select(this)
                .transition()
                .duration(150)
                .style('opacity', 0.8)
                .style('stroke-width',0)
                .style('stroke','none')
                // .style("fill", function (d) { return color(d.LABEL) })
                .attr("r", 3)
            d3.selectAll('#' + d.LABEL)
                .attr('r', 3)
            d3.selectAll('.dot')
                .style('opacity', 0.8)
        }

        // Add dots
        dots = svg.append('g')
        dots.selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", function (d) { return "dot " + d.LABEL })
            .attr("cx", function (d) { return x(+d.xval); })
            .attr("cy", function (d) { return y(+d.yval); })
            .attr("r", 3)
            .attr('id', function (d) { return d.LABEL; })
            .style("fill", function (d) { return color(d.LABEL) })
            .style('opacity', 0.8)
            .on("mouseover", mouseover)
            .on("mouseout", mouseleave)




        // ██╗     ███████╗ ██████╗ ███████╗███╗   ██╗██████╗ 
        // ██║     ██╔════╝██╔════╝ ██╔════╝████╗  ██║██╔══██╗
        // ██║     █████╗  ██║  ███╗█████╗  ██╔██╗ ██║██║  ██║
        // ██║     ██╔══╝  ██║   ██║██╔══╝  ██║╚██╗██║██║  ██║
        // ███████╗███████╗╚██████╔╝███████╗██║ ╚████║██████╔╝
        // ╚══════╝╚══════╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝╚═════╝


        // I feel I understand legends much better now.
        // define a group element for each color i, and translate it to (0, i * 20). 
        var legend = svg.selectAll('legend')
            .data(color.domain())
            .enter().append('g')
            .attr('class', 'legend')
            .attr("id", "domains")
            .attr('transform', function (d, i) { return 'translate(0,' + i * 13 + ')'; });

        // give x value equal to the legend elements. 
        // no need to define a function for fill, this is automatically fill by color.
        legend.append('rect')
            .attr('x', width - 8)
            .attr('y', 0)
            .attr('width', 9)
            .attr('height', 9)
            .style('opacity', '.95')
            .style('fill', color)
            .on('mouseover', function (d) {
                d3.select(this).attr('width', 11).attr('height', 11)
            })
            .on('mouseout', function (d) {
                d3.select(this).attr('width', 9).attr('height', 9)
            });

        // rects are defined at x value equal to width, 
        // we define text at width - 6, this will print 
        // name of the legends before the rects.
        legend.append('text')
            .attr('x', width - 15)
            .attr('y', 4)
            .attr('dy', '.35em')
            .style('text-anchor', 'end')
            .style('opacity', '.9')
            .style('font-size', '10px')
            .attr("pointer-events", "none")
            .text(function (d) { return d; });

        // Filter out what to display or not on legend mouse events
        legend
            .on('mouseover', function (type) {
                legend_select(type);
            }).on('mouseout', function (type) {
                legend_reset();
            })


        function legend_reset() {
            d3.selectAll('.dot')
                .style('opacity', 0.8)
                .attr('r', 3)
            // d3.selectAll('circle')
            //     .style('opacity', 0.7)
            // d3.selectAll("#label")
            //     .style('fill', 'white')
            //     .attr("font-size", function (d) { return radius(d.size) / 2.5; })
        }

        function legend_select(type) {
            d3.selectAll(".dot")
                .style('opacity', 0.25)
            d3.selectAll('#' + type)
                .transition()
                .duration(30)
                .attr('r', 6)
                .style('opacity', 1)
        }


        // A function that updates the chart when the user zoom and thus new boundaries are available
        function zoomed() {

            // recover the new scale
            var newX = d3.event.transform.rescaleX(x);
            var newY = d3.event.transform.rescaleY(y);

            // update axes with these new boundaries
            xAxis.call(d3.axisBottom(newX))
            yAxis.call(d3.axisLeft(newY))

            // labels.attr("transform", d3.event.transform)
            dots.attr("transform", d3.event.transform)

            dots
                .selectAll(".dot")
                .attr('x', function (d) { return newX(d.xval) })
                .attr('y', function (d) { return newY(d.yval) })
            // labels
            //     .selectAll('text')
            //     .attr("x", function (d) { return newX(d.xval); })
            //     .attr("y", function (d) { return newY(d.yval); })
        }

    });


}