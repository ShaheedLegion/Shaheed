var g_useFacebook = false;

var g_api_url = "https://immense-hamlet-8089.herokuapp.com";
var g_init = false;
var stage;

window.onload = function () {
  setTimeout(function () {
    window.scrollTo(0, 1);
  }, 500);
}

// GO!
window.addEventListener('load', function () {
  stage = document.getElementById('stage');

  // Set the dimensions to the match the client
  // This throws off game balance, but it's just a demo ;)
  //stage.style.width = '940px';
  //stage.style.height = '570px';

}, true);

// GO in 2000ms!
window.addEventListener('load', function () {
  setTimeout(function () {
    init();
  }, 2000)
}, true);

function init() {
  createMenu();
}

function BlockMove(event) {
  // Tell Safari not to move the window.
  event.preventDefault() ;
}
