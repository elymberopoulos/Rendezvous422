function initMapPage() {
  getLocation();
  
  var routeOptions = {
    transitType: google.maps.TravelMode.WALKING,
    gracePeriod: 0, //keep this in seconds!!!
    travelTime: null,
    travelSeconds: null,
    locationArray: [],
    contactNumber: null,
    contactName: null,
    startTime: null,
    countDown: false,
    alerted: false
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
    curUser = user;
  });
  function updateUsersDbLocation(lat, lng){
    if (curUser) {
      console.log(curUser.displayName);
      var userName = curUser.displayName;
      var userEndpoint = "users/" + userName + "/";
      dbRoot.once("value", function(snapshot){
        if(snapshot.hasChild(userName)){
          db.ref(userEndpoint).set({
            location:{
              "lat" : lat,
              "lng" : lng
            }
          })
        }
      })
    }else{
      console.log("noUser");
    }
  }
  function logout() {
    console.log("logout clicked.");
    if(curUser){
      if(confirm("You are about to log out. Are you sure?")) {
        document.location.href = "index.html";
        return firebase.auth().signOut();
      }      
    }else{
      console.log("no user");
    }
  };
  //  var user = firebase.auth().currentUser;
  //  console.log(user);
  // var userName;
  // if (user !== null) {
  //   userName = user.displayName;
  // } else {
  //   userName = null;
  // }
  // const db = firebase.database();
  // console.log(userName);
  // dbUserRootEndpoint.set(username)
  //   .then(() => {
  //     // log data set success to console
  //     console.log('data set...');
  //   })
  //   .catch((e) => {
  //     // catcg error from Firebase - error logged to console
  //     console.log('error returned', e);
  //   });
  // const dbUserRootEndpoint = db.ref("users");
  // const userLatEndpoint = db.ref("users/" + username + "/location/lat");
  // const userLngEndpoint = db.ref("users/" + username + "/location/lng"); //USE UPDATE// PASS OBJECT WITH NEW LAT AND LNG
  // function registerUserInDB() {
  //   if (user != null) {
  //     dbUserRootEndpoint.push({
  //       userName: {
  //         "lat": 0,
  //         "lng": 0
  //       }
  //     }).then(() => {
  //       console.log("New user registered.");
  //     }).catch((error) => {
  //       console.log("error = ", error);
  //     })
  //   }
  // }
  // //Call this function inside watch position
  // function updateUserDB(lat, lng) {
  //   db.ref().update({
  //     userLatEndpoint: lat,
  //     userLngEndpoint: lng
  //   }).then(() => {
  //     console.log("User location updated.");
  //   }).catch((error) => {
  //     console.log("error = ", error);
  //   })
  // }

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

  function routeStartedHeader(option) { //set map header to display options or not
    switch (option) {
      case true:
        document.getElementById("startTravelButton").style.display = "none";
        document.getElementById("map_canvas").style.height = "90vmax";
        //document.getElementById("radioButtons").style.display = "none";
        document.getElementById("timeDisplay").style.left = "20%";
        document.getElementById("timeDisplay").style.bottom = "40%";
        document.getElementById("timeDisplay").style.width = "64%";
        document.getElementById("timeDisplay").style.fontSize = "20px";
        document.getElementById("placeSearch").style.display = "none";
        break;
      case false:
        document.getElementById("startTravelButton").style.display = "block";
        //document.getElementById("radioButtons").style.display = "block";
        document.getElementById("map_canvas").style.height = "78vmax";
        document.getElementById("timeDisplay").style.left = "56%";
        break;
    }
  }

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
    var latLong = new google.maps.LatLng(latitude, longitude);
    routeOptions.locationArray[1] = latLong;
    placeMarkers(routeOptions.locationArray);
    document.getElementById("distanceMatrixStartLatitude").value = latitude;
    document.getElementById("distanceMatrix Longitude").value = longitude;
    console.log("Starting latitude:" + latitude);
    console.log("Starting longitude:" + longitude);
    //watchPosition();
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

  function getNow(){ //Returns unix timestamp of current moment
    return Math.floor(Date.now()/1000)
  }

  function convertSeconds(sec){
    var fullTime = new Date(null);
    fullTime.setSeconds(sec);
    return fullTime.toISOString().substr(11,8);
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
      console.log("distance: " + distanceObj.text);
      console.log("duration: " + durationObj.text);
      routeOptions.travelTime = durationObj.text; //Original Travel time then travel time remaining on WatchPosition
      //routeOptions.travelSeconds = durationObj.value;
      var timeLeft = routeOptions.countDown - getNow();
      document.getElementById("timeDisplay").innerHTML = routeOptions.travelTime + '<br>' + distanceObj.text + '<br>' + convertSeconds(timeLeft);
      if (!routeOptions.countDown && !routeOptions.alerted){
        routeOptions.countDown = routeOptions.startTime + durationObj.value + routeOptions.gracePeriod;
      }
      console.log(routeOptions.countDown + " " + getNow());
      if (routeOptions.countDown <= getNow() && !routeOptions.alerted){
        routeOptions.alerted = true;
        routeOptions.countDown = "Contacts Alerted";
        alert("Contacts have been alerted..");
      }
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
          alert('You have arrived');
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
      //routeStartedHeader(true);
      console.log(routeOptions.travelTime);
      document.getElementById("startTravelButton").style.display = "none";
      document.getElementById("map_canvas").style.height = "88vmax";
      //currentDate();
      watchPosition();
      routeOptions.startTime = getNow() - 5; //added time so user can read message.
      console.log("Starting timestamp " + routeOptions.startTime);
      alert("Route started. A timer has begun. Contacts will be notified if you do not arrive at your destination in the estimated time.");
    }

    function onBackKeyDown() {
      moveBack();
    }
    function moveBack(){
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
      },function(err){
        console.log('Error: ' + err);
      });
    }
      
    /*function findContact() {
      //var searchInput = document.getElementById(CONTACTSINPUTFIELD).value;
      var options = new ContactFindOptions();
      options.filter = "Morgan";
      options.multiple = true;
      options.desiredFields = [navigator.contacts.fieldType.name, navigator.contacts.fieldType.phoneNumbers];
      options.hasPhoneNumber = true;
      var fields = [navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name,
        navigator.contacts.fieldType.phoneNumbers
      ];
      navigator.contacts.find(fields, contactSuccess, contactError, options);
      navigator.contacts.find
    }

    function contactSuccess(contacts) {
      alert('Found ' + contacts.length + ' contacts.');
    }

    function contactError(error) {
      console.log("Cannot find contacts because of error: " + error);
    }*/

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
}

