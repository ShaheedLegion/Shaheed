//Declare global variables
var _tman;

/*
Declare the Tiles we will use to display the content.
*/

function Tile (_x, _y, _z, _el)
{
    this.x = _x;
    this.y = _y;
    this.z = _z;
    this.element = _el;
    this.w = this.element.clientWidth;
    this.h = this.element.clientHeight;
}

Tile.prototype.placeElement = function()
{
  this.element.style.position = 'absolute';
  this.element.style.display = 'inline-block';
  this.element.style.left = this.x + 'px';
  this.element.style.top = this.y + 'px';
  this.element.style.zIndex = this.z;
}

Tile.prototype.moveElement = function(_cx, _cy)
{
	this.x += _cx;
	if (_cx != 0)
	{
		var t = 0;
		t++;
	}
	this.y += _cy;
	this.element.style.left = this.x + 'px';
	this.element.style.top = this.y + 'px';
}
;

function TileRow (_w)
{
	this.tiles = new Array();
	this.cols = _w;
}

TileRow.prototype.addTile = function(tile, idx)
{
	this.tiles[idx] = tile;
}

TileRow.prototype.placeElements = function()
{
	var i;
	for (i = 0; i < this.tiles.length; i++)
		this.tiles[i].placeElement();
}

TileRow.prototype.moveElements = function(sx, sy)
{
	var i;
	for (i = 0; i < this.tiles.length; i++)
		this.tiles[i].moveElement(sx, sy);
}

TileRow.prototype.getX = function()
{
	if (this.tiles.length)
		return this.tiles[0].x;
	return 0;
}

TileRow.prototype.getY = function()
{
	if (this.tiles.length)
		return this.tiles[0].y;
	return 0;
}

TileRow.prototype.getXEnd = function()
{
	if (this.tiles.length)
	{
		var end = this.tiles.length - 1;
		return (this.tiles[end].x + this.tiles[end].w);
	}
	
	return 0;
}

TileRow.prototype.getYEnd = function()
{
	if (this.tiles.length)
		return (this.tiles[0].y + this.tiles[0].h);
	return 0;
}
;


function TileManager (_class, _rows, _cols)
{
    this._rows = new Array();
    this.tagClassName = _class;
	this.parent = 0;
    this.rows = _rows;
    this.cols = _cols - 1;
	this.cx = 0;
	this.cy = 0;
	this.mx = 0;
	this.my = 0;
	this.hw = 0;
	this.hh = 0;
	this.easingAmount = 0.095;
	this.boundary = 40;
	this._gap = 100;
	
	var speed = 6;
	this.speed_x = speed;
	this.speed_y = (speed / 2);
}

TileManager.prototype.init = function()
{
  var _tags = document.getElementsByClassName(this.tagClassName);
  this.parent = _tags[0].parentElement;
  var _i;
  var _col = 0;
  var _row = 0;
  var _col_x = 0;
  var _row_y = 0;
  
  var currrow = 0;
  this._rows[currrow] = new TileRow(this.cols);

  for (_i = 0; _i < _tags.length; _i++)
  {
    //do the width/height calculation here since tiles don't know about each other
    var currtile = new Tile(_col_x, _row_y, 5, _tags[_i]);
	this._rows[currrow].addTile(currtile, _col);

    _col_x += _tags[_i].clientWidth + this._gap;
    _col++;

    if (_col > this.cols)
    {
      _col = 0; //start at x = 0;
      _col_x = 0;
      
      _row++; //row can increment indefinitely.
      _row_y += _tags[_i].clientHeight + this._gap;
	  currrow++;
	  this._rows[currrow] = new TileRow(this.cols);
    }
  }

  for (_i = 0; _i < this._rows.length; _i++)
  {
    this._rows[_i].placeElements();
  }
  this.run(); //only run once the tiles have been placed
}

TileManager.prototype.moveRowsX = function()
{
	if (this.cx > 0)
		if (this._rows[0].getX() > this._gap)
			return 0;
	if (this.cx < 0)
		if (this._rows[0].getXEnd() < this.parent.clientWidth - this._gap)
			return 0;

	return 1;
}

TileManager.prototype.moveRowsY = function()
{
	var lastrow = this._rows.length - 1;

	if (this.cy > 0)
		if (this._rows[0].getY() > this._gap)
			return 0;
			
	if (this.cy < 0)
	{
		if (this._rows[lastrow].tiles.length == 0)
			lastrow--;
		if (this._rows[lastrow].getYEnd() < this.parent.clientHeight - this._gap)
			return 0;
	}
	return 1;
}

TileManager.prototype.anim = function()
{
	//perform all animation logic here.
	if (this.moveRowsX() == 0)
		this.cx = 0;
	if (this.moveRowsY() == 0)
		this.cy = 0;

	var _i;
	for (_i = 0; _i < this._rows.length; _i++)
	{
		this._rows[_i].moveElements(this.cx, this.cy);
	}

	this.hw = this.parent.clientWidth / 2;	//responds to window resizing
	this.hh = this.parent.clientHeight / 2;

	if (this.hh > 0 && this.hw > 0)
	{
		var xDistance = this.hw - this.mx;
		var yDistance = this.hh - this.my;
		var distance = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
		if (distance  > this.boundary || distance < -this.boundary)
		{
			this.cx = xDistance * this.easingAmount;
			this.cy = yDistance * this.easingAmount;
		}
		else
		{
			this.cx = 0;
			this.cy = 0;
		}
	}

}

TileManager.prototype.run = function()
{
	_tman.anim(); 
	setTimeout(_tman.run, 16); 
}
;

/****************************************************************/
var _menushowing;
$(document).ready(
	function()
	{
		$('#toggle').click(
			function()
			{
				if (!_menushowing)
				{
					showMenu();
					_menushowing = 1;
				}
				else
				{
					hideMenu();
					_menushowing = 0;
				}
				return false;
			}
		);

	  _tman = new TileManager ('exhibit', 3, 3);
	  _tman.init();
	  hideMenu();
	  _menushowing = 0;
	}
);

document.onmousemove = function(e)
{ 
    if (window.event)
		e = window.event; 

	var _x = e.x ? e.x : e.clientX;
	var _y = e.y ? e.y : e.clientY;

	_tman.mx = _x;
	_tman.my = _y;
}

document.addEventListener('touchmove', 
	function(e)
	{
		e.preventDefault();
		var touch = e.touches[0];
		_tman.mx = touch.pageX;
		_tman.my = touch.pageY;
	}
, false);