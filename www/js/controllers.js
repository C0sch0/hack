var colors_empresa = {"entel": "#004163", "movistar": "#9DC411", "claro": "#A21213", "vtr": "#ED4D89", "gtd": "#FF0000"}
var color_scale = d3.scale.category10();
var color_empresas_func = function(d,i){
    var k = d.key
    var color_empresas = {"entel": "#004163", "movistar": "#9DC411", "claro": "#A21213", "vtr": "#ED4D89", "gtd": "#FF0000"}
    return color_empresas[k.toLowerCase()];
}

angular.module('starter.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, $ionicPopup, $timeout) {


})

.controller('SelectCtrl', function ($scope, $ionicPopup, $ionicLoading, $state) {

  $scope.formData = {};

  $scope.ubicacion_selected = '';

  $scope.betaVersion = function(obj) {

    $scope.formData.servicio = '';

    $ionicPopup.alert({
        title: 'Beta',
        template: 'Esta función aún no está disponible.'
      });
  };

  $scope.getLocation = function() {

    $ionicLoading.show({
      template: 'Cargando...'
    }).then(function(){
       navigator.geolocation.getCurrentPosition(onSuccess, onError);
    });

    // Get geo cordenates
    function onSuccess(position) {
      $scope.ubicacion_selected = 'geo';
      $scope.formData.ubicacion = '';

      // Store cords
      window.localStorage.lat = position.coords.latitude;
      window.localStorage.lon = position.coords.longitude;
             
      console.log(position.coords.latitude + " " + position.coords.longitude);
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: ':)',
        template: 'Ubicación obtenida.'
      });
    }
    function onError(error) {
      console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
      $ionicLoading.hide();
      $ionicPopup.alert({
        title: 'Error :(',
        template: 'No hemos podido obtener su ubicación.'
      });

    }
    
  
  };

  $scope.selectCiudad = function() {
    $scope.ubicacion_selected = 'ciudad';
  }

  $scope.changeLocation = function() {
    if ($scope.formData.ubicacion) {
      $scope.ubicacion_selected = 'comuna';
    };
  }

  // Ver boton ctrl
  $scope.ver = function() {

    if (($scope.ubicacion_selected == 'geo' || $scope.formData.ubicacion || $scope.ubicacion_selected == 'ciudad') && $scope.formData.servicio)
    {

      if ($scope.ubicacion_selected != 'ciudad' ) {
        var ubicacion = ($scope.ubicacion_selected == 'geo') ? "my_location" : $scope.formData.ubicacion;
        console.log($scope.formData.ubicacion + ' ' + $scope.formData.servicio);
        $state.go('app.visualizacion', {ubicacion: ubicacion, servicio: $scope.formData.servicio});
      }
      else
      {
        // Ciudad
        $state.go('app.ciudad', {ubicacion : 'santiago', servicio: $scope.formData.servicio});
      }
      

      
    }
    else
    {

      $ionicPopup.alert({
        title: 'Error :(',
        template: 'Seleccione un lugar y tipo de servicio'
      });

    }
  };

})


.controller('CiudadCtrl', function ($scope, $state, $stateParams) {


  var ubicacion = $stateParams.ubicacion;
  var servicio = $stateParams.servicio;


  
  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", "/data/random_real_data.json", true);
  xhttp.send();

  xhttp.onreadystatechange = function () {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
        data_tweets = JSON.parse(xhttp.responseText)
        var data = getDataFormat(data_tweets, 'empresa', 'hora', 'cantidad')
        current_data = data_tweets
        crearFiltrosNoExcluyentes()
        addMainChart(data)
        addCompanyCharts(data)
        // TODO: esto no debería estar acá:
        addChoropleth(getDataFormat(data_tweets, 'comuna', 'empresa', 'cantidad'))
        //addCirclesChart(getDataFormat(data_tweets, 'comuna', 'empresa', 'cantidad'), cords)
        loadTweets()
    }
    else {
        console.log('Problema en server')
    }
  }
})

.controller('VisualizacionCtrl', function ($scope, $state, $stateParams) {


  var ubicacion = $stateParams.ubicacion;
  var servicio = $stateParams.servicio;

  var geo = false;
  if (ubicacion == "my_location") {
    geo = true;
    var cords = {lat: window.localStorage.lat, lon: window.localStorage.lon};
  } else {
    var cords = {lat: -30, lon: -70};
  }


  var xhttp = new XMLHttpRequest();
  var data_path = "/data/random_real_data.json";

  xhttp.open("GET", data_path, true);
  xhttp.send();

  xhttp.onreadystatechange = function () {
    if (xhttp.readyState == 4 && xhttp.status == 200) {
        data_tweets = JSON.parse(xhttp.responseText)
        var data = getDataFormat(data_tweets, 'empresa', 'hora', 'cantidad')
        current_data = data_tweets
        crearFiltrosNoExcluyentes()
        addMainChart(data)
        addCompanyCharts(data)
        // TODO: esto no debería estar acá:
        //addChoropleth(getDataFormat(data_tweets, 'comuna', 'empresa', 'cantidad'))
        addCirclesChart(getDataFormat(data_tweets, 'comuna', 'empresa', 'cantidad'), cords, data_path)
        //loadTweets()
    }
    else {
        console.log('Problema en server')
    }
  }

  /*
  d3.csv("data/tweets_sample.csv",function(data) {

    // Access config
    var mb_accessToken = 'pk.eyJ1IjoiZGlmbG9yZXMiLCJhIjoiY2VjNzc2ZjdmZGIwMjdmYzNjNjU5NDBlMmM3M2U4ODIifQ.u6oG-2m5DS7SqXFMCERIsQ';
    var mb_projectId = 'diflores.eeb0102a';
    var colores = ['#FF0000', '#0000FF', '#00FF00', '#FFFFFF'];

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

    // Date parse formaters
    var fullDateFormat = d3.time.format("%Y/%m/%d");
    var yearFormat = d3.time.format("%Y");
    var monthFormat = d3.time.format("%m");
    var dayFormat = d3.time.format("%d");

    // Parseo fechas
    data.forEach(function(d){
        d.rating = +d.rating;
        d.foundation_full = fullDateFormat.parse(d.date);
        d.year = +yearFormat(d.foundation_full);
        d.month = +monthFormat(d.foundation_full);
        d.day = +dayFormat(d.foundation_full);
    })

    // Entrego mis datos a crossfilter para hacer funcionar los gráficos/mapa
    var myData = crossfilter(data);

    // Variable independiente ("ejes X")
    var myDataDimension = myData.dimension(function(d){return d;});
    var dayDimension = myData.dimension(function(d){return d.day;});
    var monthDimension = myData.dimension(function(d){return d.month;});
    var yearDimension = myData.dimension(function(d){return d.year;});
    var dateDimension = myData.dimension(function(d){return d.foundation_full;})
    var companyDimension = myData.dimension(function(d){return d.company;});

    // Variable dependiente ("ejes Y")
    var YVarYear = yearDimension.group().reduceCount();
    var YVarDate = dateDimension.group().reduceCount();
    var YVarCompany = companyDimension.group().reduceCount();

    var yearChart = dc.pieChart("#chart-year");
    var ratingChart = dc.lineChart("#chart-rating");
    var dataTable = dc.dataTable('#data-table');
    var dateChart = dc.barChart("#chart-date");
    var companyChart = dc.pieChart('#chart-company');

    var empresas = [] 
    data.map(function (d){
      if (empresas.indexOf(d.company) == -1)
          empresas.push(d.company);
    });

    // Rating avg by day
    var ratingByDateGroup = dateDimension.group().reduce(
      function (p, v) {
        ++p.count;
        p.total += v.rating;
        p.avg_rating = p.total / p.count;
        return p;
      },
      function (p, v) {
        --p.count;
        p.total -= v.rating;
        p.avg_rating = p.count ? p.total / p.count : 0;
        return p;
      },
      function () {
        return { count: 0, total : 0, avg_rating : 0}
      }

    );

    var dataArray = [] 

    data.forEach(function (d){
        dataArray.push(d.foundation_full);
    })


    dateChart
        .width(900)
        .height(150)
        .dimension(dateDimension)
        .group(YVarDate)
        .x(d3.time.scale().domain([Math.min.apply(null,dataArray),Math.max.apply(null,dataArray)]))
        //.elasticY(true)
        //.centerBar(true)
        .xAxisLabel('Fecha')
        .yAxisLabel('Cantidad')
        .margins({top: 10, right: 20, bottom: 50, left: 50});


    yearChart
        .width(150)
        .height(150)
        .dimension(yearDimension)
        .group(YVarYear)
        .innerRadius(20);

    companyChart
        .width(150)
        .height(150)
        .dimension(companyDimension)
        .group(YVarCompany)
        .innerRadius(20);

    ratingChart
        .width(900)
        .height(180)
        .x(d3.scale.linear().domain([Math.min.apply(null,dataArray),Math.max.apply(null,dataArray)]))
        .brushOn(false)
        .clipPadding(10)
        .xAxisLabel('Fecha')
        .yAxisLabel("Rating")
        .dimension(dateDimension)
        .group(ratingByDateGroup)
        .valueAccessor(function (p) {
          return p.value.avg_rating;
        });


    dataTable
        .dimension(myDataDimension)
        .group(function(d){return "Necesito quitar esta fila.";})
        .size(30)
        .columns([
            function(d){return d.text;},
            function(d){return d.foundation_date;},
            function(d){return d.text;},
            function(d){return d.rating;},
            ])
        .sortBy(function(d){return d.rating;})

        // Markers
        .renderlet(function(table){

          // Clear circles list
          circlesLayer.clearLayers();

          // For each tweet, add circle
          _.each(myDataDimension.top(Infinity), function(d){

              var circle = L.circle([d.latitude,d.longitude], 500, {
                color: colores[d.id_company],
                fillColor: colores[d.id_company],
                fillOpacity: d.rating / 10
              });

              circle.bindPopup("<p>" + d.text + "</p>");

              circlesLayer.addLayer(circle);
          });

          mymap.addLayer(circlesLayer);
          mymap.fitBounds(circlesLayer.getBounds());
        })
        .order(d3.ascending);
    dc.renderAll();
});*/


})
