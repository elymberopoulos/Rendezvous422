function fireBaseInit() {
  // Initialize Firebase
  var config = {
    apiKey: "",
    authDomain: "rendezvous-219221.firebaseapp.com",
    databaseURL: "https://rendezvous-219221.firebaseio.com",
    projectId: "rendezvous-219221",
    storageBucket: "rendezvous-219221.appspot.com",
    messagingSenderId: "343762694139"
  };
  firebase.initializeApp(config);

  const db = firebase.database();
  console.log(db);
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const facebookProvider = new firebase.auth.FacebookAuthProvider();

  var googleLogin = document.getElementById('loginBtn').addEventListener('click', googleSignIn);

  function googleSignIn() {

    console.log("Google login clicked.");
    console.log(googleProvider);
    //firebase.auth().languageCode = firebase.auth().useDeviceLanguage();
    return firebase.auth().signInWithRedirect(googleProvider);
    // then(function(result) {
    //
    //   var token = result.credential.accessToken;
    //
    //   var user = result.user;
    //
    // }).catch(function(error) {
    //   var errorCode = error.code;
    //   var errorMessage = error.message;
    //   var email = error.email;
    //   var credential = error.credential;
    //
    // });
  }
  function facebookSignIn() {
    console.log("Facebook login clicked.");
    console.log(facebookProvider);
    firebase.auth().languageCode = firebase.auth().useDeviceLanguage();
    firebase.auth().signInWithPopup(facebookProvider).then(function(result) {

      var token = result.credential.accessToken;

      var user = result.user;

    }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      var email = error.email;
      var credential = error.credential;

    });
  }
}
