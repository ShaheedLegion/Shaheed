var _tman;

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

Tile.prototype.moveElement = function(_cy)
{
	this.y += _cy;
	this.element.style.top = this.y + 'px';
}

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

TileRow.prototype.moveElements = function(sy)
{
	var i;
	for (i = 0; i < this.tiles.length; i++)
		this.tiles[i].moveElement(sy);
}

TileRow.prototype.getY = function()
{
	if (this.tiles.length)
		return this.tiles[0].y;
	return 0;
}

TileRow.prototype.getYEnd = function()
{
	if (this.tiles.length)
		return (this.tiles[0].y + this.tiles[0].h);
	return 0;
}

function TileManager (_class, parent_h)
{
    this._rows = new Array();
    this.tagClassName = _class;
	this.parent = 0;
    this.rows = 0;
	this.cy = 0;
	this._gap = 17;
	this.y_dist = 0;
	this.parent_height = parent_h;
}

TileManager.prototype.init = function()
{
  var _tags = document.getElementsByClassName(this.tagClassName);
  this.parent = _tags[0].parentElement;
  var _i;
  var _col_x = 96;
  var _row_y = 0;
  this.rows = _tags.length;
  
  for (_i = 0; _i < _tags.length; _i++)
  {
	this._rows[_i] = new TileRow(1);	//come back to refactor this loop - remove currrow.

    var currtile = new Tile(_col_x, _row_y, 12, _tags[_i]);
	this._rows[_i].addTile(currtile, 0);
    _row_y += _tags[_i].clientHeight + this._gap;
  }

  for (_i = 0; _i < this._rows.length; _i++)
  {
    this._rows[_i].placeElements();
  }
  this.run(); //only run once the tiles have been placed
}

TileManager.prototype.moveUp = function()
{
	if (this.y_dist <= 0)	//keep the user from scrolling too far.
		this.y_dist = this.parent_height;
		
	if (this._rows[0].getY() >= 0)
		this.y_dist = 0;
}

TileManager.prototype.moveDown = function()
{
	if (this.y_dist >= 0)	//keep the user from scrolling too far.
		this.y_dist = -this.parent_height;
	
	var lastrow = this._rows.length - 1
	if (this._rows[lastrow].getYEnd() <= this.parent_height)
		this.y_dist = 0;
}

TileManager.prototype.anim = function()
{
	var _i, dir = 0;
	
	if (this.y_dist > 0)
	{
		dir = 1;
		this.y_dist--;
	}
	if (this.y_dist < 0)
	{
		this.y_dist++;
		dir = -1;
	}
	for (_i = 0; _i < this._rows.length; _i++)
	{
		this._rows[_i].moveElements(dir);
	}
}

TileManager.prototype.run = function()
{
	_tman.anim(); 
	setTimeout(_tman.run, 16); 
}

function navup()
{
	_tman.moveUp();
}
function navdown()
{
	_tman.moveDown();
}

$(document).ready(
	function()
	{
	  _tman = new TileManager ('exhibit', 292);	//view port height in pixels
	  _tman.init();
	}
);
