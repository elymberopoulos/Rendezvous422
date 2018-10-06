/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
//DTANCE MATRIX KEY AIzaSyCZFJ0XF038fSgyskJBsdNdpFj8ZC7tEOw

function onLoad() {
  document.addEventListener("deviceready", function() {

    var geoOptions = {
      timeout: 2000,
      enableHighAccuracy: true,
      maximumAge: 10000
    }

    //INDEXEDDB VARIABLES
    var db;
    var dataBaseName = "coordinatesDB";
    var dataBaseVersion = 1;
    var indexedDBSupported = false;
    //var dbTransaction = db.transaction("coordinatesDB", "readwrite").objectStore("coordinatesDB");
    //var coordinatesDBAccessor = dbTransaction.objectStore("coordinatesDB");
    if ("indexedDB" in window) {
      indexedDBSupported = true;
      console.log("IndexedDB supported");
    } else {
      console.log("No indexedDB support");
    }
    if (indexedDBSupported) {
      var openDB = window.indexedDB.open(dataBaseName, dataBaseVersion);
      openDB.onupgradeneeded = function(event) {
        console.log("Upgrading DB");
        var upgradeDB = event.target.reult;
        if (!upgradeDB.objectStoreNames.contains("coordinatesDBos")) {
          upgradeDB.createObjectStore("coordinatesDBos", {
            keyPath: "Favorite Locations"
          });
          console.log("New object store created");
        }
        if (!upgradeDB.objectStoreNames.contains("coordinatesDBos")) {
          upgradeDB.createObjectStore("coordinatesDBos2", {
            keyPath: "Favorite Locations"
          });
          console.log("New object store 2 created");
        }
      }
      openDB.onsuccess = function(event) {
        console.log("DB successful");
        db = event.target.result;
      }
      openDB.onerror = function(event) {
        console.log("DB ERROR");
        console.dir(event);
      }
    }
    //INDEXEDDB END=========================================================


    //EVENT HANDLERS FOR FUNCTIONS
    getLocation();
    saveCoordinates();
    //EVENT HANDLERS FOR FUNCTIONS

  }, false);

}
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
    mapTypeId: google.maps.mapTypeId.ROADMAP
  };
  var mapWithPosition = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
  var latLong = new google.maps.LatLng(latitude, longitude);

  var marker = new google.maps.marker({
    map: mapWithPosition,
    position: latLong,
    animation: google.maps.animation.DROP
  });
  marker.setMap(mapWithPosition);
  mapWithPosition.setZoom(14);
  mapWithPosition.setCenter(marker.getPosition());

}

function saveCoordinates() {
  //use navigator to get latitude and longitude and store
  //in it indexedDB with form value for key.

  //var saveKey = document.getElementById(""); // TODO: FIND WAY TO GET document
  //element value for key in data store
  navigator.geolocation.getCurrentPosition(function(position) {
      var long = position.coords.longitude;
      var lat = position.coords.latitude;
      var storeData = {
        longitude: long,
        latitude: lat
      }
      //var addData = coordinatesDBAccessor.add(storeData, saveKey);
    }), (function(error){
      console.log("error message: " + error.message + "\n" + "error code: " + error.code);
    })
  }
  onLoad();

  /*
  var app = {
      // Application Constructor
      initialize: function() {
          document.addEventListener('deviceready', this.onDeviceReady, false);
      },

      // deviceready Event Handler
      //
      // Bind any cordova events here. Common events are:
      // 'pause', 'resume', etc.
      onDeviceReady: function() {

          var geoOptions = {
            timeout: 10000,
            enableHighAccuracy: false,
            maximumAge: 10000
          }
          navigator.geolocation.getCurrentPosition(app.geoSuccess, app.geoFail, geoOptions);

          //INDEXEDDB VARIABLES
          var db;
          var dataBaseName = "coordinatesDB";
          var dataBaseVersion = 1;
          var indexedDBSupported = false;
          if("indexedDB" in window){
            indexedDBSupported = true;
            console.log("IndexedDB supported");
          }else{
            console.log("No indexedDB support");
          }
          if(indexedDBSupported){
            var openDB = window.indexedDB.open(dataBaseName, dataBaseVersion);
            openDB.onupgradeneeded = function(event){
              console.log("Upgrading DB");
              var upgradeDB = event.target.reult;
              if(!upgradeDB.objectStoreNames.contains("coordinatesDBos")){
                upgradeDB.createObjectStore("coordinatesDBos", {keyPath: "Favorite Locations"});
                console.log("New object store created");
              }
              if(!upgradeDB.objectStoreNames.contains("coordinatesDBos")){
                upgradeDB.createObjectStore("coordinatesDBos2", {keyPath: "Favorite Locations"});
                console.log("New object store 2 created");
              }
            }
            openDB.onsuccess = function(event){
              console.log("DB successful");
              db = event.target.result;
            }
            openDB.onerror = function(event){
              console.log("DB ERROR");
              console.dir(event);
            }
          }
          var dbTransaction = db.transaction("coordinatesDB","readwrite").objectStore("coordinatesDB");
          var coordinatesDBAccessor = dbTransaction.objectStore("coordinatesDB");
          //INDEXEDDB END=========================================================

          //this.receivedEvent('deviceready');
      },
      saveCoordinates: function(){
        //use navigator to get latitude and longitude and store
        //in it indexedDB with form value for key.

        //var saveKey = document.getElementById(""); // TODO: FIND WAY TO GET document
                                                    //element value for key in data store
        navigator.geolocation.getCurrentPosition(function(position){
          var long = position.coords.longitude;
          var lat = position.coords.latitude;
          var storeData = {
            longitude:long,
            latitude:lat
          }
          var addData = coordinatesDBAccessor.add(storeData,saveKey);
      }
      ,app.geoFail
    )},

      geoSuccess: function(position){
          var longitude = position.coords.longitude;
          var latitude = position.coords.latitude;
          var mapOptions = {
            center: latLongPosition,
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
          };
          var latLongPosition = new google.maps.LatLng(latitude, longitude, mapOptions);
          console.log(longitude + "\n" + latitude);
      },

      geoFail: function(error){
          console.log("the code is " + error.code + ". \n" + "message: " + error.message);
      },
      // Update DOM on a Received Event
      /*receivedEvent: function(id) {
          var parentElement = document.getElementById(id);
          var listeningElement = parentElement.querySelector('.listening');
          var receivedElement = parentElement.querySelector('.received');

          listeningElement.setAttribute('style', 'display:none;');
          receivedElement.setAttribute('style', 'display:block;');

          console.log('Received Event: ' + id);
      }
  };
  app.initialize();
  */
