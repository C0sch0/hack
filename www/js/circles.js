var comunas_path;
var comunas = {};
var tooltip;


function addCirclesChart(data, cords, data_path){

	d3.csv(data_path, function (error, data) {

		if (error) throw error;

    // Access config
    var mb_accessToken = 'pk.eyJ1IjoiZGlmbG9yZXMiLCJhIjoiY2VjNzc2ZjdmZGIwMjdmYzNjNjU5NDBlMmM3M2U4ODIifQ.u6oG-2m5DS7SqXFMCERIsQ';
    var mb_projectId = 'diflores.eeb0102a';

    // Create map
    var mymap = L.map('map').setView([cords.lat, cords.lon], 13);

    // Load tile map
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18,
      id: mb_projectId,
      accessToken: mb_accessToken
    }).addTo(mymap);

    // Layer for adding circles
    var circlesLayer = new L.FeatureGroup(); 

    // For each tweet, add circle

    // Clear circles list
    circlesLayer.clearLayers();

    for (var k in data)
    {
    	var d = data[k];
      var circle = L.circle([d.latitude,d.longitude], 500, {
        color: colors_empresa[d.empresa],
        fillColor: colors_empresa[d.empresa],
        fillOpacity: d.rating / 10
      });

      circle.bindPopup("<p>" + d.text + "</p>");

      circlesLayer.addLayer(circle);
    }

    mymap.addLayer(circlesLayer);
    mymap.fitBounds(circlesLayer.getBounds());


  });

}

function flatData(data){
	//console.log(data)
	var result = {}
	for (var k in data){
		/*console.log(k)
		console.log(data[k])*/
		result[data[k].key] = {}
		var item = data[k].values
		for (var k2 in item){
			/*console.log(k2)
			console.log(item[k2])*/
			result[data[k].key][item[k2].x] = item[k2].y
		}
	}
	//console.log(result)
	return result
}

function updateCirclesChart(filtered_data){
	var formated_data = getDataFormat(filtered_data, 'comuna', 'empresa', 'cantidad')
	var comunas_data = flatData(formated_data)
	colorComunas(comunas_data);
}



function addInteraction(){
	createTooltip();
	comunas_path.forEach(function(d, i){
		d3.select(d).on("mouseover", function(d){
		   				tooltip.html("holi")
		   						.style("left", (d3.event.pageX + 5) + "px")
			             		.style("top", (d3.event.pageY - 28) + "px")
			             		.style("opacity", 1)
		   			})
		   			.on("mouseout", function(d){
		   				tooltip.style("opacity", 0)
		   			})
	})
}

function createTooltip(){
	tooltip = d3.select("body")
								.append("div")
								.attr("class", "tooltip")
								.style("opacity", 0);
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};
