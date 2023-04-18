//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function () {

    //pseudo-global variables
    var attrArray = ["per_2011", "per_2012", "per_2013", "per_2014", "per_2015", "per_2016",
        "per_2017", "per_2018", "per_2019", "per_2020"]; //list of attributes
    var expressed = attrArray[0]; //initial attribute


    //begin script when window loads
    window.onload = setMap();

    //set up choropleth map
    function setMap() {

        //map frame dimensions
        var width = window.innerWidth * 0.5,
            height = 860;

        //create new svg container for the map
        var map = d3
            .select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

        //create Albers equal area conic projection centered on California
        var projection = d3.geoAlbers()
            .center([-36.36, 38.60])
            .rotate([84.64, 1.82, 0])
            .parallels([14.73, 46.48])
            .scale(3926.26)
            .translate([width / 2, height / 2]);

        //path to convert projection
        var path = d3.geoPath().projection(projection);

        //use Promise.all to parallelize asynchronous data loading
        var promises = [
            d3.csv("data/diabetes_data.csv"),
            d3.json("data/ca_counties_v2.topojson"),
            d3.json("data/states.topojson")
        ];
        Promise.all(promises).then(callback);

        function callback(data) {

            var csvData = data[0],
                california = data[1],
                usa = data[2];

            //translate states TopoJSON
            var ca_counties = topojson.feature(california, california.objects.ca_counties).features,
                states = topojson.feature(usa, usa.objects.ne_110m_admin_1_states_provinces);

            //add all states to map
            var lower48 = map.append("path")
                .datum(states)
                .attr("class", "states")
                .attr("d", path);



            ca_counties = joinData(ca_counties, csvData);

            var colorScale = makeColorScale(csvData);

            setEnumerationUnits(ca_counties, map, path, colorScale)

            //add coordinated visualization to the map
            setChart(csvData, colorScale);

        };
    };

    function joinData(ca_counties, csvData) {
        //loop through csv to assign each set of csv attribute values to geojson region
        for (var i = 0; i < csvData.length; i++) {
            var csvRegion = csvData[i]; //the current region
            var csvKey = csvRegion.county; //the CSV primary key

            //loop through geojson regions to find correct region
            for (var a = 0; a < ca_counties.length; a++) {

                var geojsonProps = ca_counties[a].properties; //the current region geojson properties
                var geojsonKey = geojsonProps.NAME; //the geojson primary key

                //where primary keys match, transfer csv data to geojson properties object
                if (geojsonKey == csvKey) {

                    //assign all attributes and values
                    attrArray.forEach(function (attr) {
                        var val = parseFloat(csvRegion[attr]); //get csv attribute value
                        geojsonProps[attr] = val; //assign attribute and value to geojson properties
                    });
                };
            };
        };
        return ca_counties;
    }

    //function to create color scale generator
    function makeColorScale(data) {
        var colorClasses = [
            "#D4B9DA",
            "#C994C7",
            "#DF65B0",
            "#DD1C77",
            "#980043"
        ];

        //create color scale generator
        var colorScale = d3.scaleThreshold()
            .range(colorClasses);

        //build array of all values of the expressed attribute
        var domainArray = [];
        for (var i = 0; i < data.length; i++) {
            var val = parseFloat(data[i][expressed]);
            domainArray.push(val);
        };

        //cluster data using ckmeans clustering algorithm to create natural breaks
        var clusters = ss.ckmeans(domainArray, 5);
        //reset domain array to cluster minimums
        domainArray = clusters.map(function (d) {
            return d3.min(d);
        });
        //remove first value from domain array to create class breakpoints
        domainArray.shift();
        //assign array of last 4 cluster minimums as domain
        colorScale.domain(domainArray);

        return colorScale;
    };


    function setEnumerationUnits(ca_counties, map, path, colorScale) {
        //add california counties to map
        var counties = map.selectAll(".regions")
            .data(ca_counties)
            .enter()
            .append("path")
            .attr("class", function (d) {
                return "regions " + d.properties.adm1_code;
            })
            .attr("d", path)
            .style("fill", function (d) {
                var value = d.properties[expressed];
                if (value) {
                    return colorScale(d.properties[expressed]);
                } else {
                    return "#ccc";
                }
            });
    }

    //function to create coordinated bar chart
    function setChart(csvData, colorScale) {
        //chart frame dimensions
        var chartWidth = window.innerWidth * 0.425,
            chartHeight = 473,
            leftPadding = 25,
            rightPadding = 2,
            topBottomPadding = 5,
            chartInnerWidth = chartWidth - leftPadding - rightPadding,
            chartInnerHeight = chartHeight - topBottomPadding * 2,
            translate = "translate(" + leftPadding + "," + topBottomPadding + ")";

        //create a second svg element to hold the bar chart
        var chart = d3.select("body")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("class", "chart");

        //create a rectangle for chart background fill
        var chartBackground = chart.append("rect")
            .attr("class", "chartBackground")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);

        //create a scale to size bars proportionally to frame and for axis
        var yScale = d3.scaleLinear()
            .range([463, 0])
            .domain([0, 100]);

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

        //create a text element for the chart title
        var chartTitle = chart.append("text")
            .attr("x", 40)
            .attr("y", 40)
            .attr("class", "chartTitle")
            .text("Number of Variable " + expressed[3] + " in each region");

        //create vertical axis generator
        var yAxis = d3.axisLeft()
            .scale(yScale);

        //place axis
        var axis = chart.append("g")
            .attr("class", "axis")
            .attr("transform", translate)
            .call(yAxis);

        //create frame for chart border
        var chartFrame = chart.append("rect")
            .attr("class", "chartFrame")
            .attr("width", chartInnerWidth)
            .attr("height", chartInnerHeight)
            .attr("transform", translate);
    };

})();


