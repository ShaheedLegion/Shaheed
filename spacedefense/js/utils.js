//Utility functions which are accessible to all classes in this project.

var TO_RADIANS = Math.PI / 180;

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

var _limited_device = (_mobile_device && _limited_caps) ? 1 : 0;


function IsImageOk(img)
{
    // During the onload event, IE correctly identifies any images that
    // weren’t downloaded as not complete. Others should too. Gecko-based
    // browsers act like NS4 in that they report this incorrectly.
    if (!img.complete)
        return false;

    // However, they do have two very useful properties: naturalWidth and
    // naturalHeight. These give the true size of the image. If it failed
    // to load, either of these should be zero.
    if (typeof img.naturalWidth !== "undefined" && img.naturalWidth === 0)
        return false;

    return true;    // No other way of checking: assume it’s ok.
}

function drawRotatedImage(_context, image, x, y, angle)
{
	_context.save(); 	// save the current co-ordinate system before we screw with it
	_context.translate(x, y);	// move to the middle of where we want to draw our image
	_context.rotate(angle * TO_RADIANS);	// rotate around that point, converting our angle from degrees to radians 
	_context.drawImage(image, -(image.width/2), -(image.height/2)); 	// draw it up and to the left by half the width and height of the image 
	_context.restore(); 	// and restore the co-ords to how they were when we began 
}


Vector = function(x, y)
{
	this._x = x;
	this._y = y;
}

Vector.prototype.subtract = function(target)
{
	var _vec = new Vector(this._x - target._x, this._y - target._y);
	return _vec;
}

Vector.prototype.divide = function(mod)
{
	var _vec = new Vector(this._x / mod, this._y / mod);
	return _vec;
}

function rotateAroundPoint(x, y, radius, angle)
{
	var t_x = x - radius;
	var t_y = y - radius;
	var radians = angle * TO_RADIANS;
	var ct = Math.cos(radians);
	var st = Math.sin(radians);
	var _rotated_X = (ct * (t_x - x) - st * (t_y - y)) + x;//(cos * (x - cx)) - (sin * (y - cy)) 
	var _rotated_Y = (st * (t_x - x) + ct * (t_y - y)) + y;//(sin * (x - cx)) + (cos * (y - cy))
	var P = new Vector(x, y);
	var B = new Vector(_rotated_X, _rotated_Y);
	var PB = P.subtract(B);
	return PB;
}

function drawLine(_context, x, y, x2, y2)
{
	_context.moveTo(x, y);
	_context.lineTo(x2, y2);
	_context.stroke();
}

function drawRect(_context, x, y, w, h)
{
	_context.rect(x, y, w, h);
	_context.stroke();
}

HitRect = function(x, y, w, h)
{
	this._x = x;
	this._y = y;
	this._w = w;
	this._h = h;
}

HitRect.prototype.moveTopLeft = function(dx, dy)
{
	this._x += dx;
	this._y += dy;
}

HitRect.prototype.moveBottomRight = function(dx, dy)
{
	this._w += dx;
	this._h += dy;
}

HitRect.prototype.expand = function(dx, dy)
{
	this.moveTopLeft(-dx, -dy);
	this.moveBottomRight(dx * 2, dy * 2);
}

HitRect.prototype.contract = function(dx, dy)
{
	this.moveTopLeft(dx, dy);
	this.moveBottomRight(-(dx * 2), -(dy * 2));
}

HitRect.prototype.Between = function (min, p, max)
{
  var result = 0;

  if ( min < max )
    if ( p > min && p < max )
      result = 1;

  if ( min > max )
    if ( p > max && p < min)
      result = 1;

  if ( p == min || p == max )
    result = 1;
 
  return result;
}

HitRect.prototype.HitTest = function(x, y)
{
	if (this.Between(this._x, x, this._x + this._w))
		if (this.Between(this._y, y, this._y + this._h))
			return 1;
	return 0;
}