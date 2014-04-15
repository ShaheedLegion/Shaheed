<!DOCTYPE html>
<html>
  <head>
    <title>Maze Defense!</title>

    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

    <link href="style.css" rel="stylesheet" type="text/css">
    <!--<script src="scripts/jquery-1.8.3.js"></script>-->
    <!--[if IE]><script src="scripts/excanvas.js"></script><![endif]-->
  </head>

  <body>
    <div id="fb-root"></div>
    <script src="//connect.facebook.net/en_US/all.js"></script>
<!--
    <div id="topbar">
      <img src="images/logo.png"/>
    </div>
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
  </body>
</html>