
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
    key: "AIzaSyCZFJ0XF038fSgyskJBsdNdpFj8ZC7tEOw",
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
    for (var i = 0; i < origins.length; i++) {
      var results = response.rows[i].elements;
      for (var j = 0; j < results.length; j++) {
        var element = results[j];
        var distance = element.distance.text;
        var duration = element.duration.text;
        console.log("Duration: " + duration);
      }
    }
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
