// https://rendezvous.page.link
function fireBaseInit() {

  var networkState = navigator.connection.type;
  var loginBtn = document.getElementById("loginBtn");
  var registerBtn = document.getElementById("registerBtn");
  var mapPageBtn = document.getElementById("mapPageBtn");

  if (networkState !== Connection.NONE) {
    var config = {

    };
    firebase.initializeApp(config);

    const db = firebase.database();
    console.log(db);
    var googleLogin = document.getElementById('loginBtn').addEventListener('click', googleSignIn);
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    const facebookProvider = new firebase.auth.FacebookAuthProvider();

    loginBtn.style.visibility = "visible";
    registerBtn.style.visibility = "visible";
    mapPageBtn.style.visibility = "visible";

    function googleSignIn() {
      if (networkState !== Connection.NONE) {
        console.log("Google login clicked.");
        console.log(googleProvider);
        //firebase.auth().languageCode = firebase.auth().useDeviceLanguage();
        return firebase.auth().signInWithRedirect(googleProvider);
      } else {
        alert("No network connection detected!");
      }
      then(function(result) {

        var token = result.credential.accessToken;

        var user = result.user;
        console.log(user);

      }).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;

      });
    }

    function facebookSignIn() {
      console.log("Facebook login clicked.");
      console.log(facebookProvider);
      firebase.auth().languageCode = firebase.auth().useDeviceLanguage();
      firebase.auth().signInWithPopup(facebookProvider).then(function (result) {

        var token = result.credential.accessToken;

        var user = result.user;

      }).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        var email = error.email;
        var credential = error.credential;

      });
    }


  } else {
    alert("This application requires a network connection. No network connection detected.");
  }


}