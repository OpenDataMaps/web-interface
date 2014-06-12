var map;
var markersArray = [];
var infowindow;

var listRouteNames = [];

$(document).ready(function(){
	
	$("#btnSearch").on("click",  function() {
		var routeName = $("#txtRoute").val();
		queryRoute(routeName);
	});
	
	

	google.load("visualization", "1", {"callback" : loadMap });
});

function loadMap() {
	queryRoutesNames();
	
	infoWindow = new google.maps.InfoWindow();
	google.maps.event.addDomListener(window, 'load', createMap);
	createMap();
	
	
}

function createMap() {
	  map = new google.maps.Map(document.getElementById('map-canvas'), {
          center: new google.maps.LatLng(4.59, -74.07),
          zoom: 10,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        });
	  
	 $("#map-canvas").addClass("map-canvas");

}


function queryRoutesNames() {
	var query = "SELECT 'routeNameUnique', 'item' "+
        "FROM 1XLUFQvXSMOAnUYvdaBVM7e13v_6fFF4IGc0m8olW "+
	"WHERE 'item' = '1'" +
        "GROUP BY 'routeNameUnique', 'item' "+
	"ORDER BY 'routeNameUnique' ";

	query = encodeURIComponent(query);
	
	var gvizQuery = new google.visualization.Query(
		'https://www.google.com/fusiontables/gvizdata?tq=' + query);

	gvizQuery.send(function(response) {
		var strListRoutes = "<ul>";
		var numRows = response.getDataTable().getNumberOfRows();
		// For each row in the table, create a marker
		for (var i = 0; i < numRows; i++) {
			var stringstopName = response.getDataTable().getValue(i, 0);
			listRouteNames.push(stringstopName);
			strListRoutes += '<li>' + stringstopName + '</li>';
		}
		
		strListRoutes += "</ul>";
		
		$("#list_routes").append(strListRoutes);
		$("#txtRoute").autocomplete({
			source: listRouteNames
		});
	});
	
}

function queryRoute(routeName) {
	removeMarkers();
        // Send query to Google Chart Tools to get data from table.
        // Note: the Chart Tools API returns up to 500 rows.
        

        var query = "SELECT 'stopName', 'stopAddress', 'stopLatitude', 'stopLongitude', 'stopId', 'numberStop', 'item' "+
        "FROM 1XLUFQvXSMOAnUYvdaBVM7e13v_6fFF4IGc0m8olW WHERE 'routeNameUnique' = '"+routeName+"' "+
	"AND 'item' = '1'" +
        "ORDER BY 'numberStop' ";
        query = encodeURIComponent(query);
        var gvizQuery = new google.visualization.Query(
            'https://www.google.com/fusiontables/gvizdata?tq=' + query);
	

        gvizQuery.send(function(response) {
          var numRows = response.getDataTable().getNumberOfRows();
          var texto = "";
          // For each row in the table, create a marker
          for (var i = 0; i < numRows; i++) {

            var stringstopName = response.getDataTable().getValue(i, 0);
            var stringstopAddress = response.getDataTable().getValue(i, 1);
            var stringstopLatitude = response.getDataTable().getValue(i, 2);
            var stringstopLongitude = response.getDataTable().getValue(i, 3);
            var stringstopId = response.getDataTable().getValue(i, 4);

            var coordinate = new google.maps.LatLng(stringstopLatitude, stringstopLongitude);

	    
	    createMarker(map,coordinate, stringstopName, stringstopAddress, stringstopId);



          }
        });
	
}

function prepareInfoWindow(marker, name, address, stopID) {
	var infoWindowContent = ""; //variable semi global
	var query = "SELECT 'routeNameUnique', 'stopId'"+
	"FROM 1XLUFQvXSMOAnUYvdaBVM7e13v_6fFF4IGc0m8olW WHERE 'stopId' = '"+stopID+"'";

	query = encodeURIComponent(query);
	var gvizQuery = new google.visualization.Query(
		'https://www.google.com/fusiontables/gvizdata?tq=' + query);

		gvizQuery.send(function(response) {
			var routes = "";
			var numRows = response.getDataTable().getNumberOfRows();
			// For each row in the table, create a marker
			for (var i = 0; i < numRows; i++) {
				var stringrouteNameUnique = response.getDataTable().getValue(i, 0);

				routes += '<li><a href="#">' + stringrouteNameUnique + '</a></li>';
			}
			infoWindowContent = '<b>Name: </b>' + name + '<br>';
			infoWindowContent += '<b>Address: </b>' + address + '<br>';
			infoWindowContent += '<b>Routes: </b>';
			infoWindowContent += '<div id="routes">';
			infoWindowContent += '<ul id="routes_list">';
			infoWindowContent += routes ;
			infoWindowContent += '</ul>';
			infoWindowContent += '</div>';


			showInfoWindowMarker(marker, infoWindowContent);
			$("#routes_list li a").on("click", function(){
				if( infowindow ) {
					infowindow.close();
				}
				$("#txtRoute").val(this.innerHTML);
				queryRoute(this.innerHTML);
			});
	});
}


function showInfoWindowMarker(marker, infoWindowContent) {
	infowindow = new google.maps.InfoWindow();
	infoWindow.setContent(infoWindowContent);
	infoWindow.open(map, marker);
}

function createMarker(map,coordinate,name, address , stopID) {
        var marker = new google.maps.Marker({
          map: map,
          position: coordinate,
          icon: new google.maps.MarkerImage('img/bus_stop.png')
        });
        google.maps.event.addListener(marker, 'click', function(event) {
		prepareInfoWindow(marker, name, address, stopID);
        });
	
	markersArray.push(marker);
	
}

function removeMarkers() {
	for(x = 0; x < markersArray.length; x++) {
		markersArray[x].setMap(null);
	}
	markersArray.length = 0;
}
