//begin script when window loads
window.onload = setMap();

//set up choropleth map
function setMap() {

    //map frame dimensions
    var width = 960,
        height = 460;

    //create new svg container for the map
    var map = d3
        .select("body")
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    //create Albers equal area conic projection centered on France
    var projection = d3.geoAlbers()
        .center([0, 46.2])
        .rotate([-2, 0, 0])
        .parallels([43, 62])
        .scale(2500)
        .translate([width / 2, height / 2]);

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
        console.log(csvData);
        console.log(usa);
        console.log(california);

        //translate europe TopoJSON
        var states = topojson.feature(usa, usa.objects.ne_110m_admin_1_states_provinces),
            ca_counties = topojson.feature(california, california.objects.CA_Counties_TIGER2016);

    }
};