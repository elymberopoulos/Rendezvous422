
function initMapPage() {
  var input = document.getElementById('placeSearch');
  var startInput = document.getElementById('startPoint');
  var div = document.getElementById("map_canvas");
  var map = plugin.google.maps.Map.getMap(div, {
    'controls': {
      'compass': false
    }
  });
  var locateSelfDOM = document.getElementById("locateSelfButton");
  locateSelfDOM.addEventListener("click", getLocation);
  var travelTimeButton = document.getElementById("startTravelButton")
  travelTimeButton.addEventListener("click", computeDistanceTime);

  var autocomplete = new google.maps.places.Autocomplete(input);
  var startAutoComplete = new google.maps.places.Autocomplete(startInput);

  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    var place = autocomplete.getPlace();
    var lat = place.geometry.location.lat();
    var lng = place.geometry.location.lng();
    document.getElementById("distanceMatrixDestinationLatitude").value = lat;
    document.getElementById("distanceMatrixDestinationLongitude").value = lng;
    console.log("destination latitude:" + lat);
    console.log("destination longitude:" + lng);
  });
  google.maps.event.addListener(startAutoComplete, 'place_changed', function() {
    var place = startAutoComplete.getPlace();
    var lat = place.geometry.location.lat();
    var lng = place.geometry.location.lng();
    document.getElementById("distanceMatrixStartLatitude").value = lat;
    document.getElementById("distanceMatrixStartLongitude").value = lng;
    console.log("Starting latitude:" + lat);
    console.log("Starting longitude:" + lng);
  });

  function getLocation(){
    var latitude;
    var longitude;
    navigator.geolocation.getCurrentPosition(function(position){
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      console.log("latitude is:" + latitude);
      console.log("longitude is" + longitude);
      onLocateSuccess(latitude, longitude);
    }), (function(error){
      console.log("error message: " + error.message + "\n" + "error code: " + error.code);
    }),
    {enableHighAccuracy: true}
  }
  function onLocateSuccess(latitude, longitude){
    var mapOptions = {
      center: new google.maps.LatLng(0, 0),
      zoom: 1,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var mapWithPosition = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    var latLong = new google.maps.LatLng(latitude, longitude);

    var marker = new google.maps.Marker({
      map: mapWithPosition,
      position: latLong,
      animation: google.maps.Animation.DROP
    });
    marker.setMap(mapWithPosition);
    mapWithPosition.setZoom(14);
    mapWithPosition.setCenter(marker.getPosition());

  }

function computeDistanceTime() {
  var startLat = document.getElementById("distanceMatrixStartLatitude").value;
  var startLng = document.getElementById("distanceMatrixStartLongitude").value;
  var destinationLat = document.getElementById("distanceMatrixDestinationLatitude").value;
  var destinationLng = document.getElementById("distanceMatrixDestinationLongitude").value;
  var originValues = startLat + "," + startLng;
  var destinationValues = destinationLat + "," + destinationLng;
  /*if (startLat || startLng || destinationLat || destinationLng === null) {
    alert("Please enter values for all required fields.");
  }*/
  var distanceService = new google.maps.DistanceMatrixService();
  distanceService.getDistanceMatrix({
    origins: [originValues],
    destinations: [destinationValues],
    travelMode: google.maps.TravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.IMPERIAL,
    avoidHighways: false,
    avoidTolls: false
  }, matrixCallback);
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
    console.log(distanceObj);
    console.log(durationObj);
    /*
    for (var i = 0; i < origins.length; i++) {
      var results = response.rows[i].elements;
      for (var j = 0; j < results.length; j++) {
        var element = results[j];
        var distance = element.distance.text;
        var duration = element.duration.text;
        console.log("Duration: " + duration);
      }
    }*/
    /*
    var overallTravelTime = response.rows[0].elements[0].duration;
    var travelTimeSeconds = overallTravelTime % 60;
    var travelTimeMinutes = Math.floor(overallTravelTime / 60);
    var travelTimeHours = Math.floor(overallTravelTime / travelTimeMinutes);
    console.log("Hours :" + travelTimeHours);
    console.log("Minutes :" + travelTimeMinutes);
    console.log("Seconds: " + travelTimeSeconds);
    */
  }
}
}
