// https://rendezvous.page.link
const firebaseConfig = {
  
};
function fireBaseInit() {
  var networkState = navigator.connection.type;
  var loginBtn = document.getElementById("loginBtn");
  var registerBtn = document.getElementById("registerBtn");
  var mapPageBtn = document.getElementById("mapPageBtn");
  var logoutBtn = document.getElementById("logoutBtn");
  if (networkState !== Connection.NONE) {
<<<<<<< HEAD
    var config = {
      apiKey: "AIzaSyCVoSGosWTkRgL69T4Au3aGrCBgViBuI1M",
      authDomain: "rendezvous-219221.firebaseapp.com",
      databaseURL: "https://rendezvous-219221.firebaseio.com",
      projectId: "rendezvous-219221",
      storageBucket: "rendezvous-219221.appspot.com",
      messagingSenderId: "343762694139"
    };
    firebase.initializeApp(config);
=======
    firebase.initializeApp(firebaseConfig);
>>>>>>> d5bc1646eeee347ae5d88b0be8322d48ae8dc96f

    const db = firebase.database();
    var user = firebase.auth().currentUser;
    console.log(db);
    const dbRoot = db.ref("users");

    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // loginBtn.style.visibility = "hidden";
        // logoutBtn.style.visibility = "visible";
        console.log(user.displayName);
        var userName = user.displayName;
        var userEndpoint = "users/" + userName + "/";
        dbRoot.once("value", function(snapshot){
          if(!snapshot.hasChild(userName)){
            db.ref(userEndpoint).set({
              location:{
                "lat" : 0,
                "lng" : 0
              }
            })
          }
        })
        document.location.href = "mapPage.html";
        //OLD VERSION (had auto generated key)
        // dbRoot.once("value", function (snapshot) {
        //   if (!snapshot.hasChild(userName)) {
        //     db.ref("users/" + userName + "/").push({
        //       location: {
        //         "lat": 0,
        //         "lng": 0
        //       }
        //     });
        //   }
        // })
      }else{
        //document.location.href = "index.html";
        loginBtn.style.visibility = "visible";
      }
    });



    var googleLogin = document.getElementById('loginBtn').addEventListener('click', googleSignIn);
    //var signOut = logoutBtn.addEventListener("click", logout);
    const googleProvider = new firebase.auth.GoogleAuthProvider();
    const facebookProvider = new firebase.auth.FacebookAuthProvider();

    // loginBtn.style.visibility = "visible";
    //registerBtn.style.visibility = "visible";
    // mapPageBtn.style.visibility = "visible";
    // logoutBtn.style.visibility = "visible";

    // function checkEndPointNotNull(){
    //   dbRoot.once("value", function(snapshot){
    //     if(!snapshot.hasChild(userName)){
    //       return true;
    //     }
    //     else{
    //       return false;
    //     }
    //   })
    // }

    

    function googleSignIn() {
      console.log("Google login clicked.");
      console.log(googleProvider);
      loginBtn.style.visibility = "hidden";
      //firebase.auth().languageCode = firebase.auth().useDeviceLanguage();
      return firebase.auth().signInWithRedirect(googleProvider);
    }
    //   then(function(result) {

    //     var token = result.credential.accessToken;

    //     var user = result.user;
    //     console.log(user);

    //   }).catch(function(error) {
    //     var errorCode = error.code;
    //     var errorMessage = error.message;
    //     var email = error.email;
    //     var credential = error.credential;

    //   });
    // }

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
 /*function logout(user) {
    console.log("logout clicked.");
    if(user){
      return firebase.auth().signOut();
    }else{
      console.log("no user");
    }
  };*/
}