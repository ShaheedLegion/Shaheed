var _tman;

function Tile (_x, _y, _z, _el)
{
    this.x = _x;
    this.y = _y;
    this.z = _z;
    this.element = _el;
	this.details = 0;
	for (var i = 0; i < this.element.children.length; i++)
	{
		if (this.element.children[i].nodeName == "DIV")
			this.details = this.element.children[i];
	}
    this.w = this.element.clientWidth;
    this.h = this.element.clientHeight;
}

Tile.prototype.placeElement = function()
{
  this.element.style.position = 'absolute';
  this.element.style.display = 'block';
  this.element.style.left = this.x + 'px';
  this.element.style.top = this.y + 'px';
  this.element.style.zIndex = this.z;
  
  this.details.style.position = 'absolute';
  this.details.style.display = 'block';
  this.details.style.left = this.x + 10 + 'px';
  this.details.style.top = 0 + 'px';
  /*this.details.style.zIndex = this.z;*/
}

Tile.prototype.moveElement = function(_cy)
{
	this.y += _cy;
	this.element.style.top = this.y + 'px';
	//this.details.style.top = this.y + 'px';
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

TileRow.prototype.expandTile = function(show)
{
	if (show)
	{
		if (this.tiles[0].details.clientWidth < 100)
			$(this.tiles[0].details).stop(true,true).animate({'width': 100 + 'px'}, 1000).show(1000);
	}
	else
	{
		if (this.tiles[0].details.clientWidth > 80)
		{
			$(this.tiles[0].details).stop(true,true).animate({'width': 80 + 'px'}, 1000).hide(1000);
		}
	}
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
	this._gap = 18;
	this.y_dist = 0;
	this.animating = 0;
	this.parent_height = parent_h;
}

TileManager.prototype.init = function()
{
  var _tags = document.getElementsByClassName(this.tagClassName);
  this.parent = _tags[0].parentElement;
  var _i;
  var _col_x = 86;
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

TileManager.prototype.displayDetails = function()
{
	for (var i = 0; i < this._rows.length; i++)
	{
		if (this._rows[i].getY() >=0 && this._rows[i].getY() < this.parent_height)
		{
			this._rows[i].expandTile(1);
		}
	}
}

TileManager.prototype.hideDetails = function()
{
	for (var i = 0; i < this._rows.length; i++)
	{
		this._rows[i].expandTile(0);
	}
}

TileManager.prototype.moveUp = function()
{
	if (this.y_dist <= 0)	//keep the user from scrolling too far.
		this.y_dist = this.parent_height;
		
	if (this._rows[0].getY() >= 0)
		this.y_dist = 0;
	else
	{
		this.hideDetails();
		this.animating = 1;
	}
}

TileManager.prototype.moveDown = function()
{
	if (this.y_dist >= 0)	//keep the user from scrolling too far.
		this.y_dist = -this.parent_height;
	
	var lastrow = this._rows.length - 1
	if (this._rows[lastrow].getYEnd() <= this.parent_height)
		this.y_dist = 0;
	else
	{
		this.hideDetails();
		this.animating = 1;
	}
}

TileManager.prototype.anim = function()
{
	var _i, dir = 0, speed = 6;
	
	if (this.y_dist > 0)
	{
		this.y_dist -= speed;
		dir = speed;
	}
	if (this.y_dist < 0)
	{
		this.y_dist += speed;
		dir = -speed;
	}
	for (_i = 0; _i < this._rows.length; _i++)
	{
		this._rows[_i].moveElements(dir);
	}
	if (this.animating)
	{
		if (dir == 0)
		{
			this.displayDetails();
			this.animating = 0;
		}
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
	{	//view port must have even height (in pixels)
	  _tman = new TileManager ('exhibit', 294);	//view port height in pixels
	  _tman.init();
	}
);
