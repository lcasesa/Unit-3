//set bars for each province
var bars = chart.selectAll(".bar")
.data(csvData)
.enter()
.append("rect")
.sort(function (a, b) {
    return b[expressed] - a[expressed]
})
.attr("class", function (d) {
    return "bar " + d.adm1_code;
})
.attr("width", chartInnerWidth / csvData.length - 1)
.attr("x", function (d, i) {
    return i * (chartInnerWidth / csvData.length) + leftPadding;
})
.attr("height", function (d, i) {
    return 463 - yScale(parseFloat(d[expressed]));
})
.attr("y", function (d, i) {
    return yScale(parseFloat(d[expressed])) + topBottomPadding;
})
.style("fill", function (d) {
    return colorScale(d[expressed]);
});


//set bars for each province
var bars = chart.selectAll(".bar")
.data(csvData)
.enter()
.append("rect")
.sort(function (a, b) {
    return b[expressed] - a[expressed]
})
.attr("class", function (d) {
    return "bar " + d.adm1_code;
})
.attr("width", chartInnerWidth / csvData.length - 1);