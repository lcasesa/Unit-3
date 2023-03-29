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
        .center([14.91, 38.59])
        .rotate([134.91, 0, 0])
        .parallels([18.68, 38.61])
        .scale(1489.90)
        .translate([width / 2, height / 2]);

    //path to convert projection
    var path = d3.geoPath().projection(projection);

    //use Promise.all to parallelize asynchronous data loading
    var promises = [
        d3.csv("data/diabetes_data.csv"),
        d3.json("data/ca_counties.topojson"),
        d3.json("data/states.topojson")
    ];
    Promise.all(promises).then(callback);

    function callback(data) {

        var csvData = data[0],
            california = data[1],
            usa = data[2];
        
        //translate states TopoJSON
        var states = topojson.feature(usa, usa.objects.ne_110m_admin_1_states_provinces),
            ca_counties = topojson.feature(california, california.objects.CA_Counties_TIGER2016);

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
            .attr("class", function(d){
                return "regions " + d.properties.adm1_code;
            })
            .attr("d", path);
    }
};