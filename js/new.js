//function to create coordinated bar chart
function setChart(csvData, colorScale) {
    //chart frame dimensions
    var chartWidth = window.innerWidth * 0.425,
        chartHeight = 460;

    //create a second svg element to hold the bar chart
    var chart = d3.select("body")
        .append("svg")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("class", "chart");

    //create a scale to size bars proportionally to frame
    var yScale = d3.scaleLinear()
        .range([0, chartHeight])
        .domain([0, 105]);

    //set bars for each province
    var bars = chart.selectAll(".bars")
        .data(csvData)
        .enter()
        .append("rect")
        .sort(function (a, b) {
            return a[expressed] - b[expressed]
        })
        .attr("class", function (d) {
            return "bars " + d.adm1_code;
        })
        .attr("width", chartWidth / csvData.length - 1)
        .attr("x", function (d, i) {
            return i * (chartWidth / csvData.length);
        })
        .attr("height", function (d) {
            return yScale(parseFloat(d[expressed]));
        })
        .attr("y", function (d) {
            return chartHeight - yScale(parseFloat(d[expressed]));
        }).style("fill", function (d) {
            return colorScale(d[expressed]);
        });

    //annotate bars with attribute value text
    var numbers = chart.selectAll(".numbers")
        .data(csvData)
        .enter()
        .append("text")
        .sort(function (a, b) {
            return a[expressed] - b[expressed]
        })
        .attr("class", function (d) {
            return "numbers " + d.adm1_code;
        })
        .attr("text-anchor", "middle")
        .attr("x", function (d, i) {
            var fraction = chartWidth / csvData.length;
            return i * fraction + (fraction - 1) / 2;
        })
        .attr("y", function (d) {
            return chartHeight - yScale(parseFloat(d[expressed])) + 15;
        })
        .text(function (d) {
            return d[expressed];
        });

    //below Example 2.8...create a text element for the chart title
    var chartTitle = chart.append("text")
        .attr("x", 20)
        .attr("y", 40)
        .attr("class", "chartTitle")
        .text("Percentage of adults aged 20+ with diabetes " + expressed[3] + " per county");

};