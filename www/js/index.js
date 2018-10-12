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
    //getLocation();
    //saveCoordinates();
    //EVENT HANDLERS FOR FUNCTIONS

  }, false);

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
