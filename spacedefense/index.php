<!DOCTYPE html>
<html>
  <head>
    <title>Space Defense! Written by Shaheed Abdol</title>

    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <link href="style.css" rel="stylesheet" type="text/css">
  </head>

  <body>
    <script>
	var _mobile_device = 0;	//Global var (yes, bad practice) to help detection of mobile devices
	var _limited_caps = 0;	//Global var to (kind of) determine if the device has limited capabilities
	var _debug_mobile = 0;	//set to true to emulate mobile behaviour on pc.

	if (!Function.prototype.bind)  //Function.bind Shim for older browsers
	{
		Function.prototype.bind = function (oThis)
		{
			if (typeof this !== "function")
			{	// closest thing possible to the ECMAScript 5 internal IsCallable function
				throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
			}

			var aArgs = Array.prototype.slice.call(arguments, 1), fToBind = this, fNOP = function () {},
			fBound = function ()
			{
			  return fToBind.apply(this instanceof fNOP && oThis ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
			};

			fNOP.prototype = this.prototype;
			fBound.prototype = new fNOP();
			return fBound;
		};
	}
	var isMobile =
	{
		Android: function() { return navigator.userAgent.match(/Android/i); },
		BlackBerry: function() { return navigator.userAgent.match(/BlackBerry/i); },
		iOS: function() { return navigator.userAgent.match(/iPhone|iPad|iPod/i); },
		webOS: function() { return navigator.userAgent.match(/webOS/i); },
		Opera: function() { return navigator.userAgent.match(/Opera Mini/i); },
		Windows: function() { return navigator.userAgent.match(/IEMobile/i); },
		any: function()
		{
			return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows() || isMobile.webOS());
		}
	};
	if (isMobile.any())
	{
		_mobile_device = 1;
		var windowWidth = window.screen.width < window.outerWidth ? window.screen.width : window.outerWidth;
		_limited_caps = windowWidth < 500;
	}
	if (_debug_mobile)
	{
		_mobile_device = 1;
		_limited_caps = 1;
	}
    </script>

    <div id="stage">
      <div id="gameboard">
          <canvas id="myCanvas"></canvas>
      </div>
    </div>

	<script src="js/observer.js"></script>
	<script src="js/canvas.js"></script>
	<script src="js/projectiles.js"></script>
	<script src="js/states.js"></script>
	<script src="js/screens.js"></script>
	<script src="js/game.js"></script>
  </body>
</html>