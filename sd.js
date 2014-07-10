var g_ctx;
var g_points;
var sw;
var sh;
var mousex;
var mousey;
var g_pt;
var g_cycle = 0;

function initialize()
{
	var _cs = document.getElementById("graphics");
	if (_cs)
	{
		g_pt = new Point();
		_cs.addEventListener("mousemove", handlemouse, false);
		g_ctx = _cs.getContext("2d");
		g_ctx.globalAlpha = 0.25;
		g_points = new Array();
		setInterval(handleTimer, 30);
	} 
}

window.onload = initialize;
window.onresize = handleresize;

Point = function()
{
	this.init();
}

Point.prototype.init = function()
{
	var hsw = sw / 10;
	var hsh = sh / 10;
	this.x = (Math.random() * hsw) - (hsw / 2);
	this.y = (Math.random() * hsw) - (hsh / 2);
	this.z = (Math.random() * 100) + 1;
	this.tx = 0;
	this.ty = 0;
}
Point.prototype.set = function (x, y, z)
{
	this.x = x;
	this.y = y;
	this.z = z;
}

Point.prototype.update = function (cx, cy, sw, sh, hsw, hsh, check)
{
	this.z -= 2;

	if (check)
	{
		if (this.z < 0 || this.tx < 0 || this.ty < 0 || this.tx > sw || this.ty > sh)
			this.init();
	}

	this.tx = ((this.x / this.z) * sw) + hsw + cx;
	this.ty = ((this.y / this.z) * sh) + hsh + cy;
}
function handleTimer()
{
	if (g_points.length == 0)	//add points to the array
	{
		handleresize();
		mousex = sw / 2;
		mousey = sh / 2;

		var numpoints = 500;	//works well for desktop and mobile devices.
		var pt; 
		for (var i = 0; i < numpoints; ++i)
		{
			pt = new Point();
			g_points.push(pt);
		}
	}
	
	var points = g_points.length;
	var pt;
	
	var hsw = sw / 2;
	var hsh = sh / 2;
	var cx = (mousex - hsw) + hsw;
	var cy = (mousey - hsh) + hsh;

	for (var i = 0; i < points; ++i)
	{
		pt = g_points[i];	//fetch the point from global memory
		pt.update(cx, cy, sw, sh, hsw, hsh, 1);
		g_points[i] = pt;	//stash the point back into global memory
	}
	
	g_ctx.fillStyle = "#000000";
	g_ctx.fillRect(0, 0, sw, sh);
	//g_ctx.strokeStyle = "#fbfbfb";	//blue

	for (var i = 0; i < points; ++i)
	{	//render points without transforming, theoretically this should be faster
		pt = g_points[i];	//copy the points out of global memory ... might be slow, profile to test.

         	g_ctx.strokeStyle = "hsl(" + ((g_cycle * i) % 360) + "," + Math.floor(pt.z * 2.4) + "%,80%)";

		g_pt.set(pt.x, pt.y, pt.z + 4);
		g_pt.update(cx, cy, sw, sh, hsw, hsh, 0);

		g_ctx.beginPath();
		g_ctx.moveTo(pt.tx, pt.ty);
		g_ctx.lineTo(g_pt.tx, g_pt.ty);
		g_ctx.stroke();
		g_ctx.closePath();

		g_cycle += 0.01;
	}
}

function handleresize()
{
	if (!g_ctx)
		return;

	sw = document.body.clientWidth;
	sh = document.body.clientHeight;
	var _cs = document.getElementById("graphics");

	if (_cs)
	{
		_cs.width = sw;
		_cs.height = sh;
		g_ctx.globalAlpha = 0.25;
	}	
}
function handlemouse(e)
{
	mousex = e.clientX - (sw / 2);
	mousey = e.clientY - (sh / 2);
}
