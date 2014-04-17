<!DOCTYPE html>
<html>
  <head>
    <title>Maze Defense! Written by Shaheed Abdol</title>

    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

    <link href="style.css" rel="stylesheet" type="text/css">
  </head>

  <body>
  <!--
<div id="fb-root"></div>
    <script>
	window.fbAsyncInit = function() {
	FB.init({
	  appId      : '742067679179085',
	  status     : true,
	  xfbml      : true
	});
	
	FB.Event.subscribe('auth.authResponseChange', function(response) {
		if (response.status === 'connected') {
		  console.log('Logged in');
		  login_callback();
		} else {
			console.log("Not logged in - " + response.status);
		  FB.login(login_callback);
		}
	  });
	};

	(function(d, s, id){
	 var js, fjs = d.getElementsByTagName(s)[0];
	 if (d.getElementById(id)) {return;}
	 js = d.createElement(s); js.id = id;
	 js.src = "//connect.facebook.net/en_US/all.js";
	 fjs.parentNode.insertBefore(js, fjs);
	}(document, 'script', 'facebook-jssdk'));
	
	function login_callback() {
    console.log('Welcome!  Fetching your information.... ');
    FB.api('/me', function(response) {
      console.log('Good to see you, ' + response.name + '.');
    });
  }
    </script>
-->
    <div id="stage">
      <div id="gameboard">
          <canvas id="myCanvas"></canvas>
      </div>
    </div>

	<script src="js/observer.js"></script>
	<script src="js/canvas.js"></script>
	<script src="js/states.js"></script>
	<script src="js/screens.js"></script>
	<script src="js/game.js"></script>
	<!--
<fb:login-button show-faces="true" width="200" max-rows="1"></fb:login-button>
-->
  </body>
</html>