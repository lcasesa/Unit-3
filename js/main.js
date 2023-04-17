//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function () {

    //pseudo-global variables
    var attrArray = ["varA", "varB", "varC", "varD", "varE"]; //list of attributes
    var expressed = attrArray[0]; //initial attribute


    //begin script when window loads
    window.onload = setMap();

    //set up choropleth map
    function setMap() {

        //map frame dimensions
        var width = 1200,
            height = 960;

        //create new svg container for the map
        var map = d3
            .select("body")
            .append("svg")
            .attr("class", "map")
            .attr("width", width)
            .attr("height", height);

        //create Albers equal area conic projection centered on California
        var projection = d3.geoAlbers()
            .center([-36.36, 39.96])
            .rotate([82.82, 1.82, 0])
            .parallels([14.27, 36.31])
            .scale(2346.47)
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

            //add california counties to map
            var counties = map.selectAll(".regions")
                .data(ca_counties)
                .enter()
                .append("path")
                .attr("class", function (d) {
                    return "regions " + d.properties.adm1_code;
                })
                .attr("d", path);

            ca_counties = joinData(ca_counties, csvData);

            var colorScale = makeColorScale(csvData);

            setEnumerationUnits(ca_counties,map,path,colorScale)

        };
    };

    function joinData(ca_counties, csvData) {
        //loop through csv to assign each set of csv attribute values to geojson region
        for (var i = 0; i < csvData.length; i++) {
            var csvRegion = csvData[i]; //the current region
            var csvKey = csvRegion.adm1_code; //the CSV primary key

            //loop through geojson regions to find correct region
            for (var a = 0; a < ca_counties.length; a++) {

                var geojsonProps = ca_counties[a].properties; //the current region geojson properties
                var geojsonKey = geojsonProps.adm1_code; //the geojson primary key

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
    }


    function setEnumerationUnits(ca_counties,map,path,colorScale){
        //add France regions to map
        var counties = map.selectAll(".regions")
            .data(ca_counties)
            .enter()
            .append("path")
            .attr("class", function(d){
                return "regions " + d.properties.adm1_code;
            })
            .attr("d", path)
            .style("fill", function(d){
                var value = d.properties[expressed];
                if(value) {
                    return colorScale(d.properties[expressed]);
                } else {
                    return "#ccc";
                }
        });
    }
    
})();


