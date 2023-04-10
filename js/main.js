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
        .center([-38.18, 39.05])
        .rotate([81.00, 0.91, 0])
        .parallels([9.73, 36.31])
        .scale(2270.71)
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
        var ca_counties = topojson.feature(california, california.objects.CA_Counties_TIGER2016),
        states = topojson.feature(usa, usa.objects.ne_110m_admin_1_states_provinces);

        //create graticule generator
        var graticule = d3.geoGraticule()
            .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

        //create graticule lines
        var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
            .data(graticule.lines()) //bind graticule lines to each element to be created
            .enter() //create an element for each datum
            .append("path") //append each element to the svg as a path element
            .attr("class", "gratLines") //assign class for styling
            .attr("d", path); //project graticule lines

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