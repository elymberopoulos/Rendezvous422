
function initMapPage() {
  getLocation();
  var div = document.getElementById("map_canvas");
  var mapOptions = {
    center: new google.maps.LatLng(39.8283, -98.5795),
    zoom: 3,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
 
  var locationArray = []; //first is destination, second is start
  var transitType = google.maps.TravelMode.WALKING;
  var travelTime;
  
  //API declarations 
  var input = document.getElementById('placeSearch');
  var autocomplete = new google.maps.places.Autocomplete(input);
  var bounds = new google.maps.LatLngBounds();//allows zooming of map to fit markers 
  var directionsService = new google.maps.DirectionsService();
  var directionsDisplay = new google.maps.DirectionsRenderer();
  var distanceService = new google.maps.DistanceMatrixService();

  var mapWithPosition = new google.maps.Map(div, mapOptions);
  directionsDisplay.setMap(mapWithPosition);

  //EVENT LISTENERS 
  var walk = document.getElementById("walk");
  var drive = document.getElementById("drive");
  var transit = document.getElementById("transit");
  walk.addEventListener("click",setTravelMode);
  drive.addEventListener("click",setTravelMode);
  transit.addEventListener("click",setTravelMode);
  //var locateSelfDOM = document.getElementById("locateSelfButton");
  //locateSelfDOM.addEventListener("click", getLocation);
  var startTravelBtn = document.getElementById("startTravelButton")
  startTravelBtn.addEventListener("click", startRoute);


  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    directionsDisplay.setMap(null);//clear route line

    var place = autocomplete.getPlace();
    var lat = place.geometry.location.lat();
    var lng = place.geometry.location.lng();
    document.getElementById("distanceMatrixDestinationLatitude").value = lat;
    document.getElementById("distanceMatrixDestinationLongitude").value = lng;
    var latLong = new google.maps.LatLng(lat, lng);
    locationArray[0] = latLong;
    placeMarkers(locationArray);
    routeStartedHeader(false);
    console.log("destination latitude:" + lat);
    console.log("destination longitude:" + lng);
    mapWithPosition.fitBounds(bounds);//fit markers
    computeDistanceTime();
  });

  function routeStartedHeader(option){//set map header to display options or not
    switch(option){
      case true:
        document.getElementById("startTravelButton").style.display = "none";
        document.getElementById("map_canvas").style.height = "90vmax";
        document.getElementById("radioButtons").style.display = "none";
        document.getElementById("timeDisplay").style.left = "34%";
        break;
      case false:
        document.getElementById("startTravelButton").style.display = "block";
        document.getElementById("radioButtons").style.display = "block";
        document.getElementById("map_canvas").style.height = "78vmax";
        document.getElementById("timeDisplay").style.left = "56%";
        break;
    }
  }

  function getLocation(){
    var latitude;
    var longitude;

    navigator.geolocation.getCurrentPosition(function(position){
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      onLocateSuccess(latitude, longitude);
    }, function(error){
      console.log("error message: " + error.message + "\n" + "error code: " + error.code);
      alert("Could not find location, Turn on location and try again");
      document.location.href = 'index.html';
    },
    {enableHighAccuracy: true, timeout: 8000});
  }
  function onLocateSuccess(latitude, longitude){
    document.getElementById("waitForLocation").style.display = "none";
    directionsDisplay.setMap(null);
    var latLong = new google.maps.LatLng(latitude, longitude);
    locationArray[1] = latLong;
    placeMarkers(locationArray);
    document.getElementById("distanceMatrixStartLatitude").value = latitude;
    document.getElementById("distanceMatrixStartLongitude").value = longitude;
    console.log("Starting latitude:" + latitude);
    console.log("Starting longitude:" + longitude);
    //watchPosition();
  }

  var markerArray = [] //start and end markers 
  function clearMarkers(mArray){
    for (var i = 0; i < mArray.length; i++ ) {
      mArray[i].setMap(null);
    }
  }

  function placeMarkers(markers){
    clearMarkers(markerArray);
    markers.forEach(function(element) {
      var marker = new google.maps.Marker({
        map: mapWithPosition,
        position: element,
        animation: google.maps.Animation.DROP
      });
      markerArray.push(marker);
      marker.setMap(mapWithPosition);
      mapWithPosition.setZoom(14);
      mapWithPosition.setCenter(marker.getPosition());
      bounds.extend(marker.getPosition());//extend bounds for map to fit markers
    });     
  }

function computeDistanceTime() {
  directionsDisplay.setMap(mapWithPosition);
  calcRoute(false);
  var startLat = document.getElementById("distanceMatrixStartLatitude").value;
  var startLng = document.getElementById("distanceMatrixStartLongitude").value;
  var destinationLat = document.getElementById("distanceMatrixDestinationLatitude").value;
  var destinationLng = document.getElementById("distanceMatrixDestinationLongitude").value;
  var originValues = startLat + "," + startLng;
  var destinationValues = destinationLat + "," + destinationLng;
  /*if (startLat || startLng || destinationLat || destinationLng === null) {
    alert("Please enter values for all required fields.");
  }*/
  distanceService.getDistanceMatrix({
    origins: [originValues],
    destinations: [destinationValues],
    travelMode: transitType,
    unitSystem: google.maps.UnitSystem.IMPERIAL,
    avoidHighways: false,
    avoidTolls: false
  }, matrixCallback);
}

function calcRoute(){
  clearMarkers(markerArray);
  var request = {
    origin: locationArray[1],
    destination: locationArray[0],
    travelMode: transitType
  };
  directionsService.route(request, function(response, status) {
    if (status == 'OK') {
      directionsDisplay.setDirections(response);
    }
  });
}

function matrixCallback(response, status) {
  if (status !== "OK") {
    alert("Error was: " + status);
  } else {
    var origins = response.orignAddress;
    var destinations = response.destinationAddresses;
    const distanceObj = response.rows[0]['elements'][0]['distance'];
    const durationObj = response.rows[0]['elements'][0]['duration'];
    // log test objects to console
    console.log('reponse = ', response);
    console.log(distanceObj.text);
    console.log(durationObj.text);
    travelTime = durationObj.text;
    document.getElementById("timeDisplay").innerHTML = travelTime + '<br>' + distanceObj.text;
  }
}
  function watchPosition(){
    var options = {
      enableHighAccuracy: true,
      maximumAge: 3500,
      timeout: 5000
    };

    var curMarker = new google.maps.Marker({
      map: mapWithPosition,
      position: locationArray[1],
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });
    markerArray[1].setMap(null);
    curMarker.setMap(mapWithPosition);
    mapWithPosition.setZoom(17);
    mapWithPosition.setCenter(curMarker.getPosition());

    var watchID = navigator.geolocation.watchPosition(function(position){
      var watchedLatitude = position.coords.latitude;
      var watchedLongitude = position.coords.longitude;
      console.log("watchedLatitude is: " + watchedLatitude);
      console.log("watchedLongitude is: " + watchedLongitude);
      var curLatLng = new google.maps.LatLng(watchedLatitude, watchedLongitude);//move marker with user
      curMarker.setPosition(curLatLng)
    },(function(error){
      console.log("Watch Position error message: " + error.message + "\n" + "error code: " + error.code);
    }), options);
  }

  function setTravelMode(){
    placeMarkers(locationArray)
    switch(this.value){
      case "WALKING":
        transitType = google.maps.TravelMode.WALKING;
        break;
      case "DRIVING":
        transitType = google.maps.TravelMode.DRIVING;
        break;
      case "TRANSIT":
        transitType = google.maps.TravelMode.TRANSIT;
        break;
      default:
        transitType = google.maps.TravelMode.WALKING;
    }
    computeDistanceTime();
    if (locationArray[0] != null){
      calcRoute();
    }
  }

  function startRoute(){
    routeStartedHeader(true);
    watchPosition();

  }

  function findContact(){
    var searchInput = document.getElementById(CONTACTSINPUTFIELD).value;
    var options = new ContactFindOptions();
    options.filter = searchInput;
    options.multiple = true;
    options.desiredFields = [navigator.contacts.fieldType.name, navigator.contacts.fieldType.phoneNumbers];
    options.hasPhoneNumber = true;
    var fields = [navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name,
      navigator.contacts.fieldType.phoneNumbers];
    navigator.contacts.find(fields, contactSuccess, contactError, options);
    navigator.contacts.find
  }
  function contactSuccess(contacts){
    alert('Found ' + contacts.length + ' contacts.');
  }
  function contactError(error){
    console.log("Cannot find contacts because of error: " + error);
  }
}
