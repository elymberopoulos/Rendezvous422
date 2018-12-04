function initMapPage() {
  getLocation();
  var routeOptions = {
    transitType: google.maps.TravelMode.WALKING,
    gracePeriod: null,
    travelTime: null,
    travelSeconds: null,
    locationArray: [],
    contactNumber: null,
    contactName: null,
    durationValue: 0, //seconds
    arrivalTime: null
  }

  var div = document.getElementById("map_canvas");
  var mapOptions = {
    center: new google.maps.LatLng(39.8283, -98.5795),
    zoom: 3,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  // var locationArray = []; //first is destination, second is start
  // var transitType = google.maps.TravelMode.WALKING;
  // var travelTime;
  //FIREBASE Declarations
  
  firebase.initializeApp(firebaseConfig);

  const db = firebase.database();
  var curUser = firebase.auth().currentUser;
  console.log(db);
  const dbRoot = db.ref("users");

  firebase.auth().onAuthStateChanged((user) => {
    if(user){
      curUser = user; 
    }   
  });
  function updateUsersDbLocation(lat, lng){
    if (curUser) {
      console.log(curUser.displayName);
      var userName = curUser.displayName;
      var userName = curUser.displayName;
      var contactRef = dbRoot.child(userName).child("location");
      contactRef.update({
         "lat": lat,
         "lng": lng
      })
    }else{
      console.log("noUser");
    }
  }
  
  function updateDbContact(contactNum,contactName){
    if (curUser && contactNum !==null) {
      console.log(curUser.displayName);
      var userName = curUser.displayName;
      var contactRef = dbRoot.child(userName).child("emergencyContact");
      contactRef.update({
         "phone": contactNum,
         "name": contactName
      })
      
    }else{
      console.log("noUser or contactNum");
    }
  }

  function logout() {
    console.log("logout clicked.");
    if(curUser){
      if(confirm("You are about to log out. Are you sure?")) {
        firebase.auth().signOut();
        document.location.href = "index.html";
      }      
    }else{
      console.log("no user");
    }
  };
  
  // Firebase declaration end


  //API declarations 
  cordova.plugins.backgroundMode.enable();
  var input = document.getElementById('placeSearch');
  var autocomplete = new google.maps.places.Autocomplete(input);
  var bounds = new google.maps.LatLngBounds(); //allows zooming of map to fit markers 
  var directionsService = new google.maps.DirectionsService();
  var directionsDisplay = new google.maps.DirectionsRenderer();
  var distanceService = new google.maps.DistanceMatrixService();
  var mapWithPosition = new google.maps.Map(div, mapOptions);
  directionsDisplay.setMap(mapWithPosition);

  //EVENT LISTENERS 
  document.addEventListener("backbutton", onBackKeyDown, false);
  var hamburgerButton = document.getElementById("fafabars").addEventListener("click", hamburgerMenu);
  var closeHamburgerButton = document.getElementById("closeFaFaBars").addEventListener("click", hamburgerMenu);
  var menu = document.getElementById("mapPageHamburgerScreen");
  var closeMenu = document.getElementById("closeFaFaBars");
  var walk = document.getElementById("walk");
  var drive = document.getElementById("drive");
  var transit = document.getElementById("transit");
  walk.addEventListener("click", setTravelMode);
  drive.addEventListener("click", setTravelMode);
  transit.addEventListener("click", setTravelMode);
  //var locateSelfDOM = document.getElementById("locateSelfButton");
  //locateSelfDOM.addEventListener("click", getLocation);
  var startTravelBtn = document.getElementById("startTravelButton")
  startTravelBtn.addEventListener("click", startRoute);
  document.getElementById("logoutBtn").addEventListener("click",logout);
  //cordova.plugins.backgroundMode.on("enable",moveBack);


  google.maps.event.addListener(autocomplete, 'place_changed', function () {
    directionsDisplay.setMap(null); //clear route line
    document.getElementById("timeDisplay").style.display = "block";
    routeOptions.durationValue = 0;
    var place = autocomplete.getPlace();
    var lat = place.geometry.location.lat();
    var lng = place.geometry.location.lng();
    document.getElementById("distanceMatrixDestinationLatitude").value = lat;
    document.getElementById("distanceMatrixDestinationLongitude").value = lng;
    var latLong = new google.maps.LatLng(lat, lng);
    routeOptions.locationArray[0] = latLong;
    placeMarkers(routeOptions.locationArray);
    //routeStartedHeader(false);
    document.getElementById("startTravelButton").style.display = "block";
    document.getElementById("map_canvas").style.height = "78vmax";


    console.log("destination latitude:" + lat);
    console.log("destination longitude:" + lng);
    mapWithPosition.fitBounds(bounds); //fit markers
    computeDistanceTime();
  });

  function getLocation() {
    var latitude;
    var longitude;

    navigator.geolocation.getCurrentPosition(function (position) {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      onLocateSuccess(latitude, longitude);
    }, function (error) {
      console.log("error message: " + error.message + "\n" + "error code: " + error.code);
      alert("Could not find location, Turn on location and try again");
      navigator.app.exitApp();
    }, {
      enableHighAccuracy: true,
      timeout: 8000
    });
  }

  function onLocateSuccess(latitude, longitude) {
    document.getElementById("waitForLocation").style.display = "none";
    directionsDisplay.setMap(null);
    updateUsersDbLocation(latitude,longitude);
    var latLong = new google.maps.LatLng(latitude, longitude);
    routeOptions.locationArray[1] = latLong;
    placeMarkers(routeOptions.locationArray);
    document.getElementById("distanceMatrixStartLatitude").value = latitude;
    document.getElementById("distanceMatrixStartLongitude").value = longitude;
    console.log("Starting latitude:" + latitude);
    console.log("Starting longitude:" + longitude);
  }

  var markerArray = [] //start and end markers 
  function clearMarkers(mArray) {
    for (var i = 0; i < mArray.length; i++) {
      mArray[i].setMap(null);
    }
  }

  function placeMarkers(markers) {
    clearMarkers(markerArray);
    markers.forEach(function (element) {
      var marker = new google.maps.Marker({
        map: mapWithPosition,
        position: element,
        animation: google.maps.Animation.DROP
      });
      markerArray.push(marker);
      marker.setMap(mapWithPosition);
      mapWithPosition.setZoom(14);
      mapWithPosition.setCenter(marker.getPosition());
      bounds.extend(marker.getPosition()); //extend bounds for map to fit markers
    });
  }


  function computeDistanceTime() {
    directionsDisplay.setMap(mapWithPosition);
    calcRoute();
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
      travelMode: routeOptions.transitType,
      unitSystem: google.maps.UnitSystem.IMPERIAL,
      avoidHighways: false,
      avoidTolls: false
    }, matrixCallback);
  }


  function calcRoute() {
    clearMarkers(markerArray);
    var request = {
      origin: routeOptions.locationArray[1],
      destination: routeOptions.locationArray[0],
      travelMode: routeOptions.transitType
    };
    directionsService.route(request, function (response, status) {
      if (status == 'OK') {
        directionsDisplay.setDirections(response);
      }
    });
  }

  function matrixCallback(response, status) {
    if (status !== "OK") {
      alert("Error was: " + status);
    } else {
      console.log(response);
      var origins = response.orignAddress;
      var destinations = response.destinationAddresses;
      const distanceObj = response.rows[0]['elements'][0]['distance'];
      const durationObj = response.rows[0]['elements'][0]['duration'];
      // log test objects to console
      console.log('reponse = ', response);
      console.log(distanceObj.text);
      console.log(durationObj.text);
      if(routeOptions.durationValue === 0){
        routeOptions.durationValue = durationObj.value;
      }      
      routeOptions.travelTime = durationObj.text; //Original Travel time then travel time remaining on WatchPosition
      routeOptions.travelSeconds = durationObj.value;
      document.getElementById("timeDisplay").innerHTML = routeOptions.travelTime + '<br>' + distanceObj.text;
    }
  }

  function watchPosition() {
    var options = {
      enableHighAccuracy: true,
      maximumAge: 3500,
      timeout: 5000
    };

    var curMarker = new google.maps.Marker({
      map: mapWithPosition,
      position: routeOptions.locationArray[1],
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });
    markerArray[1].setMap(null);
    curMarker.setMap(mapWithPosition);
    mapWithPosition.setZoom(17);
    mapWithPosition.setCenter(curMarker.getPosition());

    var watchID = navigator.geolocation.watchPosition(function (position) {
      var watchedLatitude = position.coords.latitude;
      var watchedLongitude = position.coords.longitude;
      console.log("watchedLatitude is: " + watchedLatitude);
      console.log("watchedLongitude is: " + watchedLongitude);
      var curLatLng = new google.maps.LatLng(watchedLatitude, watchedLongitude); //move marker with user
      curMarker.setPosition(curLatLng);
      updateUsersDbLocation(watchedLatitude,watchedLongitude);

      if (checkArrival(routeOptions.locationArray[0], curLatLng, watchID)) {
        var message = "I have arrived safely";
        sendSMS(routeOptions.contactNumber,message,true);
        curMarker.setMap(null);
      } else if((new Date().getTime() / 1000) >= routeOptions.arrivalTime){
        var message = "I did not make it on time";
        sendSMS(routeOptions.contactNumber,message,false);
        navigator.geolocation.clearWatch(watchID);
        curMarker.setMap(null);
      }
      distanceService.getDistanceMatrix({ //update travel time remaining 
        origins: [curLatLng],
        destinations: [routeOptions.locationArray[0]],
        travelMode: routeOptions.transitType,
        unitSystem: google.maps.UnitSystem.IMPERIAL,
        avoidHighways: false,
        avoidTolls: false
      }, matrixCallback);
    }, (function (error) {
      console.log("Watch Position error message: " + error.message + "\n" + "error code: " + error.code);
    }), options);
  }


    function setTravelMode() {
      placeMarkers(routeOptions.locationArray)
      switch (this.value) {
        case "WALKING":
          routeOptions.transitType = google.maps.TravelMode.WALKING;
          break;
        case "DRIVING":
          routeOptions.transitType = google.maps.TravelMode.DRIVING;
          break;
        case "TRANSIT":
          routeOptions.transitType = google.maps.TravelMode.TRANSIT;
          break;
        default:
          routeOptions.transitType = google.maps.TravelMode.WALKING;
      }
      if (routeOptions.locationArray[0] != null) {
        computeDistanceTime();
        calcRoute();
      }
    }

    function startRoute() {
      if(routeOptions.contactName === null || routeOptions.contactNumber === null){
        alert("Cannot start route without valid contact");
      }else{
        //routeStartedHeader(true);
        console.log(routeOptions.travelTime);
        document.getElementById("startTravelButton").style.display = "none";
        document.getElementById("map_canvas").style.height = "88vmax";
        //currentDate();
        routeOptions.arrivalTime = (new Date().getTime() / 1000) + routeOptions.durationValue;
        document.getElementById("placeSearch").disabled = true;
        watchPosition();
      }
    }

    function sendSMS(num,mess,arrived){
      var app = {
        sendSms: function(number,message) {
            var number = num;
            var message = mess;
            console.log("number=" + number + ", message= " + message);
    
            var options = {
                replaceLineBreaks: false, 
                android: {
                    intent: ''  
                    //intent: '' // send SMS without open any other app
                }
            };
            
            var success = function (arrival) { 
              console.log("Message Sent");
              if(arrival){
                alert('Message sent that you arrived safely');
              }else{
                alert('Message sent that you did not arrive')
              }
              if(confirm("Would you like to start another route?")){
                startNewRoute();
              }else{
                navigator.app.exitApp();
              }
            };
            var error = function (e) { alert('Message Failed:' + e); };
            sms.send(number, message, options, success(arrived), error);
            

            
        }
      };
      app.sendSms();  
    }

    function onBackKeyDown() {
      cordova.plugins.backgroundMode.moveToBackground(); 
    }
    

    function checkArrival(destinationLatLng, watchedLatLng, watcher) { //check arrival and clear watch position if true 
      if (((destinationLatLng.lat() - .0004) < watchedLatLng.lat()) && (watchedLatLng.lat() < (destinationLatLng.lat() + .0004))) {
        if ((destinationLatLng.lng() - .0004) < watchedLatLng.lng() && watchedLatLng.lng() < (destinationLatLng.lng() + .0004)) {
          navigator.geolocation.clearWatch(watcher);
          console.log("true");
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }

    document.getElementById("contactBtn").addEventListener("click",pickContact);
    
    function pickContact(){
      navigator.contacts.pickContact(function(contact){
        document.getElementById("contactBtn").style.backgroundColor = "silver";
        
        console.log(contact);
        console.log(contact.phoneNumbers[0]['value']);
        console.log(contact.displayName + contact.phoneNumbers[0]['value']);
        routeOptions.contactName = contact.displayName;
        routeOptions.contactNumber = contact.phoneNumbers[0]['value'];
        document.getElementById("selectedContact").innerHTML = routeOptions.contactName;
        updateDbContact(routeOptions.contactNumber, routeOptions.contactName);
      },function(err){
        console.log('Error: ' + err);
      });
    }
      

    function hamburgerMenu() {
      document.getElementById("waitForLocation").innerHTML = "";
      document.getElementById("waitForLocation").addEventListener("click",hamburgerMenu);
      if (menu.style.width == "0%") {
        menu.style.width = "55%";
        document.getElementById("waitForLocation").style.display = "block";
      } else if (menu.style.width !== "0%") {
        document.getElementById("waitForLocation").style.display = "none";
        menu.style.width = "0%";
      }
    }

    function startNewRoute(){
      directionsDisplay.setMap(null);
      directionsService = new google.maps.DirectionsService();
      directionsDisplay = new google.maps.DirectionsRenderer();
      routeOptions.durationValue = 0;
      document.getElementById("placeSearch").value = "";
      document.getElementById("timeDisplay").style.display = "none";
      document.getElementById("placeSearch").disabled = false;
      //routeOptions.locationArray = [];
      clearMarkers(markerArray);
    }
}

