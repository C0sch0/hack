var comunas_path;
var comunas = {};
var tooltip;

function addChoropleth(data){
	d3.xml("data/Comunas_de_Santiago_(nombres).svg", "image/svg+xml", function(error, xml) {
		if (error) throw error;
		loadComunas(xml);
		comunas_data = flatData(data)
		/*console.log(comunas_data)
		crearDatosRandomComunas();
		console.log(comunas)*/
		colorComunas(comunas_data);
		/*addInteraction();*/
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

function updateChoropleth(filtered_data){
	var formated_data = getDataFormat(filtered_data, 'comuna', 'empresa', 'cantidad')
	var comunas_data = flatData(formated_data)
	colorComunas(comunas_data);
}

function loadComunas(xml){
	var div_ch = document.getElementById("choropleth_comunas")
	div_ch.appendChild(xml.documentElement);

	var svg = d3.select("#choropleth_comunas svg");

	
	comunas_path = svg.selectAll("path")[0];

	comunas_path.forEach(function(item, index) {
			new_id = item.id
			new_id = new_id.replaceAll(" ", "_")
			item.id = new_id
			comunas[item.id] = {}
		})
}

function crearDatosRandomComunas(){
	for (var key in comunas) {
		item = comunas[key]
		item["entel"] = Math.floor(Math.random() * 100) + 1  
		item["movistar"] = Math.floor(Math.random() * 100) + 1  
	}
}

function colorComunas(data_comunas){
	var color_empresas = {"entel": "#004163", "movistar": "#9DC411", "claro": "#A21213", "vtr": "#ED4D89", "gtd": "#FF0000"}
	console.log(data_comunas)
	min_v = 100000
	max_v = -1
	for (var key in data_comunas) {
		item = data_comunas[key]
		max_value = -1
		max_empresa = ''
		for (var empresa in item){
			if(item[empresa] > max_value){
				max_value = item[empresa]
				max_empresa = empresa
			}
		}
		if(max_value > max_v)
			max_v = max_value
		if(max_value < min_v)
			min_v = max_value
		data_comunas[key]["max_value"] = max_value
		data_comunas[key]["max_empresa"] = max_empresa
	}
 var opacity_scale = d3.scale.linear()
					.domain([min_v, max_v])
    			.range([0, 1]);
	for (var key in data_comunas) {
		max_value = data_comunas[key]["max_value"]
		max_empresa = data_comunas[key]["max_empresa"]
		d3.select("#" + key).style("fill", color_empresas[max_empresa.toLowerCase()]).style("opacity", opacity_scale(max_value)) 
	}
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
