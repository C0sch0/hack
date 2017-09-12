var tweets_empresa_tiempo_nvd3chart;
var tweets_empresa_tiempo_chart;
var data_tweets;

var empresas_nvd3chart = {}
var empresas_chart = {}

var current_data;

function createChart(maxY, show_legend, empresa) {
    var parser = d3.timeParse("%Y-%m-%d %H:%M:%S")
    var nvd3chart = nv.models.lineChart()
        .margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
        .useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
        //.transitionDuration(350)  //how fast do you want the lines to transition?
                .color(function (d, i) {
                        if (empresa)
                            return color_empresas_func(d,i)
                        else
                            return color_scale(d.key)
                })
        .x(function (d) {
            return parser(d.x)
        })
        .y(function (d) {
            return d.y
        })
        .forceY([0, maxY])
        .showLegend(show_legend)       //Show the legend, allowing users to turn on/off line series.
        .showYAxis(true)        //Show the y-axis
        .showXAxis(true)        //Show the x-axis
        ;

    nvd3chart.xAxis
        .tickFormat(function (d) {
            return d3.time.format("%d-%m-%Y %Hhr")(new Date(d))
        });

    nvd3chart.xScale(d3.time.scale());

    nvd3chart.yAxis     //Chart y-axis settings
        .axisLabel('Número de Tweets')
        .tickFormat(d3.format('.02f'));

    return nvd3chart;
}

function addCompanyCharts(data) {
    var divEmpresas = d3.select('#tweets_empresas_tiempo_topico')
    for (var i = 0; i < data.length; i++) {
        var title = data[i].key // Nombre empresa == título gráfico
        var data_i = data_tweets.filter(function (d) {
            return d.empresa == title
        })
        data_i = getDataFormat(data_i, 'topico', 'hora', 'cantidad')
                max_value = -1
                for(var x in data_i){
                    item = data_i[x].values
                    for(var c = 0; c<item.length; ++c){
                        item_2 = item[c]
                        if(item_2.y > max_value)
                            max_value = item_2.y
                    }
                }
        var svg_i = divEmpresas.append('div')
            .attr('class', 'col-md-12')
            .attr('id', title)
            .append('svg');
        svg_i.append("text")
            .attr("x", 200)
            .attr("y", 10)
            .attr("text-anchor", "middle")
            .text(title);
        var nvd3_i = createChart(max_value, false, false) // TODO hacer automático
        svg_i.datum(data_i)
            .call(nvd3_i);
        nv.utils.windowResize(function () {
            nvd3_i.update
        });

        nv.addGraph(nvd3_i)
        empresas_chart[title] = svg_i
        empresas_nvd3chart[title] = nvd3_i
        console.log(nvd3_i)

    }
}


function addMainChart(data) {

        console.log(data)
        max_value = -1
        for(var x in data){
            console.log(data[x])
            item = data[x].values
            for(var c = 0; c<item.length; ++c){
                item_2 = item[c]
                console.log(item_2)
                if(item_2.y > max_value)
                    max_value = item_2.y
            }
        }

    tweets_empresa_tiempo_nvd3chart = createChart(max_value, false, true) //TODO calcular desde los datos
    tweets_empresa_tiempo_chart = d3.select('#tweets_empresa_tiempo svg')    //Select the <svg> element you want to render the chart in.
        .datum(data)
        .call(tweets_empresa_tiempo_nvd3chart);
    nv.utils.windowResize(function () {
        tweets_empresa_tiempo_nvd3chart.update
    });
    tweets_empresa_tiempo_nvd3chart.legend.dispatch.on('legendClick', function (e) {

        var new_current = current_data.filter(function (d) {
            return (e.disabled == false && d.empresa != e.key)
        }) // Estaban en la lista y los vamos a eliminar
        var to_add = data_tweets.filter(function (d) {
            return e.disabled == true & d.empresa == e.key;
        }) // No estaban en la lista

        if (new_current.length == 0) { // Se agregan elementos
            to_add.forEach(function (v) {
                current_data.push(v)
            })
        } else {
            current_data = new_current
        }
        // TODO manejar el caso en que todos los puntitos han sido desactivados
        updateCompanyCharts(current_data)
    })
    nv.addGraph(tweets_empresa_tiempo_nvd3chart)
}

function updateCompanyCharts(data) {
    for (var name in empresas_chart) {
        var chart = empresas_chart[name]
        var data_i = data.filter(function (d) {
            return d.empresa == name;
        })
        if (data_i.length > 0) {
            data_i = getDataFormat(data_i, 'topico', 'hora', 'cantidad')
            chart.datum(data_i).transition().duration(1000).call(empresas_nvd3chart[name]);
            nv.utils.windowResize(chart.update);
        }
        else {
            // TODO hace algo con los gráficos que no son de la empresa seleccionada
            chart.datum([]).transition().duration(1000).call(empresas_nvd3chart[name]);
            nv.utils.windowResize(chart.update);
        }
    }
}
function updateMainChart(data) {
    data = getDataFormat(data, 'empresa', 'hora', 'cantidad')
    tweets_empresa_tiempo_chart.datum(data).transition().duration(1000).call(tweets_empresa_tiempo_nvd3chart);
    // Update the chart during the window screen resizing
    nv.utils.windowResize(tweets_empresa_tiempo_chart.update);
}

function onFilterChange() {
    var filtered_data;
    // Primero los excluyentes
    var exclusive = document.querySelectorAll("[name=tipo]")
    for (var i = 0; i< exclusive.length; i++){
        if(exclusive[i].checked) {
            if (exclusive[i].value != "todos") {
                filtered_data = data_tweets.filter(function (d) {
                    return d[exclusive[i].name] == exclusive[i].value
                })
            }
            else if (exclusive[i].value == "todos") {
                console.log(exclusive[i])
                filtered_data = data_tweets
            }
        }
    }
    // Los no excluyentes
    var empresa = document.querySelectorAll("[name=empresa]")
        console.log(empresa)
    var pos_values_empresa = []
    for (var i=0; i<empresa.length; i++){
        if(empresa[i].checked){
            pos_values_empresa.push(empresa[i].value)
        }
    }
        console.log(pos_values_empresa)
    filtered_data = filtered_data.filter(function(d){
        return pos_values_empresa.indexOf(d['empresa'])!=-1
    })
    var tipo = document.querySelectorAll("[name=topico]")
    var pos_values_tipo = []
    for (var i=0; i<tipo.length; i++){
        if(tipo[i].checked){
            pos_values_tipo.push(tipo[i].value)
        }
    }
    filtered_data = filtered_data.filter(function(d){
        return pos_values_tipo.indexOf(d['topico'])!=-1
    })

        updateCompanyCharts(filtered_data)
        updateMainChart(filtered_data)
                updateChoropleth(filtered_data)

}

function getDataFormat(data, key, x, y) {
    var data_gb = groupBy(data, function (d) {
        return [d[key]]
    })
    var result = []
    for (var i = 0; i < data_gb.length; i++) {
        var hora_agg = groupBy(data_gb[i], function (d) {
            return [d[x]]
        })
        var values = []
        for (var j = 0; j < hora_agg.length; j++) {
            values.push({
                x: hora_agg[j][0][x], y: d3.sum(hora_agg[j], function (d) {
                    return d[y]
                })
            })
        }
        result.push({key: data_gb[i][0][key], 'values': values, disabled: false})
    }
    return result
}

function groupBy(array, f) {
    var groups = {};
    array.forEach(function (o) {
        var group = JSON.stringify(f(o));
        groups[group] = groups[group] || [];
        groups[group].push(o);
    });
    return Object.keys(groups).map(function (group) {
        return groups[group];
    })
}

function crearFiltrosNoExcluyentes(){
    // TODO: que estos topicos y empresas salgan de los datos
    var empresas = ["entel", "movistar", "VTR"]
    var topicos = ["velocidad", "continuidad", "servicio_cliente"]
    crearFiltroEmpresas(empresas)
    crearFiltroTopicos(topicos)
}

function crearFiltroEmpresas(empresas){
    var color_empresas = {"entel": "#0173AF", "movistar": "#9DC411", "claro": "#A21213", "vtr": "#ED4D89", "gtd": "#FF0000"}
    var div = document.getElementById("filtro_empresa")
    var newLabel = document.createElement("label");
    newLabel.appendChild(document.createTextNode("Selecciona una o más empresas: "));
    div.appendChild(newLabel);
    div.appendChild(document.createElement('br'));

    for (var e in empresas){
        var tmp_label = document.createElement("label");
        tmp_label.class = "checkbox-inline"
        tmp_label.style["background-color"] = color_empresas[empresas[e].toLowerCase()]
        var tmp_input = document.createElement("input");
        tmp_input.type = "checkbox";
        tmp_input.name = "empresa";
        tmp_input.value = empresas[e];
        tmp_input.onchange = onFilterChange
        tmp_input.checked = true
        tmp_label.appendChild(tmp_input);
        tmp_label.appendChild(document.createTextNode(empresas[e]));
        div.appendChild(tmp_label);

    }

}

function crearFiltroTopicos(topicos){
    var div = document.getElementById("filtro_topicos")
    var newLabel = document.createElement("label");
    newLabel.appendChild(document.createTextNode("Selecciona tipo de problema: "));
    div.appendChild(newLabel);
    div.appendChild(document.createElement('br'));

    for (var t in topicos){
        var tmp_label = document.createElement("label");
        tmp_label.class = "checkbox-inline"
        tmp_label.style["background-color"] = color_scale(topicos[t])
        var tmp_input = document.createElement("input");
        tmp_input.type = "checkbox";
        tmp_input.name = "topico";
        tmp_input.value = topicos[t];
        tmp_input.onchange = onFilterChange
        tmp_input.checked = true
        tmp_label.appendChild(tmp_input);
        tmp_label.appendChild(document.createTextNode(topicos[t]));
        div.appendChild(tmp_label);

    }

}
