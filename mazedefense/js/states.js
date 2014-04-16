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

StartScreen = function(_handler, _broadcaster)
{
	this._handler = _handler;
	this._broadcaster = _broadcaster;
	this._sprite = new Image();
	this._sprite.src = "images/button_play.png";
	this._w = 0;
	this._h = 0;
	
	this._broadcaster.registerObserver('click', this.handleClick.bind(this));
	this._broadcaster.registerObserver('resize', this.handleResize.bind(this));
	
	this._data_points = new Array();	//set up the data points for the background effect.
	for (var i = 0; i < 12; i++)
		this._data_points.push(-1);
}

StartScreen.prototype.checkBackground = function(offset)
{
	if (this._data_points[0 + offset] == -1)	//not set yet
	{
		this._data_points[0 + offset] = (Math.random() * (this._w / 4)) + 2;
		this._data_points[1 + offset] = (Math.random() * (this._h / 4)) + 2;
		
		this._data_points[2 + offset] = (this._data_points[0 + offset] + ((this._w / 4) * 3) + 2);
		this._data_points[3 + offset] = (this._data_points[1 + offset] + ((this._h / 4) * 3) + 2);
		
		this._data_points[4 + offset] = (Math.random() * 10) > 5 ? 1 : -1;
		this._data_points[5 + offset] = (Math.random() * 6) + 3;	//minimum display time of 2 seconds.
	}
	
	var y_eq = 0;
	if (this._data_points[4 + offset] > 0)	//move horizontally
	{
		if (this._data_points[0 + offset] < this._data_points[2 + offset])
			this._data_points[0 + offset] += this._data_points[5 + offset];
		else if (this._data_points[0 + offset] > this._data_points[2 + offset])
			this._data_points[0 + offset] -= this._data_points[5 + offset];
		if (Math.abs(this._data_points[0 + offset] - this._data_points[2 + offset]) < 20)
			this._data_points[4 + offset] = -1;
	}
	else	//move vertically
	{
		if (this._data_points[1 + offset] < this._data_points[3 + offset])
			this._data_points[1 + offset] += this._data_points[5 + offset];
		else if (this._data_points[1 + offset] > this._data_points[3 + offset])
			this._data_points[1 + offset] -= this._data_points[5 + offset];
		if (Math.abs(this._data_points[1 + offset] - this._data_points[3 + offset]) < 20)
			y_eq = 1;
	}
	
	if (y_eq == 1)
	{
		this._data_points[0 + offset] = -1;
		return 0;
	}
	return 1;
}

StartScreen.prototype.drawBackground = function(_context)
{
	_context.clearRect(0, 0, this._w, this._h);

	var _p1 = this.checkBackground(0);
	var _p2 = this.checkBackground(6);
	
	if (_p1)	//draw the first set of points...
	{
		_context.beginPath();
		_context.moveTo(this._data_points[0], 0);
		_context.lineTo(this._data_points[0], this._h);
		_context.stroke();
		
		_context.moveTo(0, this._data_points[1]);
		_context.lineTo(this._w, this._data_points[1]);
		_context.stroke();
	}
	if (_p2)	//draw the second set of points...
	{
		_context.beginPath();
		_context.moveTo(this._data_points[6], 0);
		_context.lineTo(this._data_points[6], this._h);
		_context.stroke();
		
		_context.moveTo(0, this._data_points[7]);
		_context.lineTo(this._w, this._data_points[7]);
		_context.stroke();
	}
}

StartScreen.prototype.render = function(_context)
{
	this.drawBackground(_context);
	if (IsImageOk(this._sprite))
	{
		var x = (this._w / 2) - (this._sprite.width / 2);
		var y = (this._h / 2) - (this._sprite.height / 2);
		this._handler._canvas_handler._context.drawImage(this._sprite, Math.floor(x), Math.floor(y), this._sprite.width, this._sprite.height);
	}
}

StartScreen.prototype.handleClick = function(vars)
{
	if (IsImageOk(this._sprite))
	{
		var x = (this._w / 2) - (this._sprite.width / 2);
		var y = (this._h / 2) - (this._sprite.height / 2);
		if (vars[0] > x && vars[1] > y)
		{
			if (vars[0] < (x + this._sprite.width) && vars[1] < (y + this._sprite.height))
				this._broadcaster.broadcast('StartScreenClick', vars);
		}
	}
}

StartScreen.prototype.handleResize = function(vars)
{
	this._w = vars[0];
	this._h = vars[1];
}

/******************************************************************************************************/
//run the actual game here!
	GameGrid = function(cells, dim)
	{
		this._rows = cells;
		this._cols = cells;
		this._cellsize = dim;
		this._view_w = 0;
		this._view_h = 0;
		
		this._current_row = this._rows / 2;
		this._current_col = this._cols / 2;
	}
	
	GameGrid.prototype.render = function(_context)
	{
		_context.fillStyle = "#6B3e7c";
		_context.fillRect(0, 0, 100, 100);
	}
	GameGrid.prototype.handleResize = function(w, h)
	{
		this._view_w = (w / 2);
		this._view_h = (h / 2);
		
		
	}
	
GameScreen = function(_handler, _broadcaster)
{
	this._handler = _handler;
	this._broadcaster = _broadcaster;
	this._sprites = new Array();
	this._w = 0;
	this._h = 0;
	
	this._broadcaster.registerObserver('click', this.handleClick.bind(this));
	this._broadcaster.registerObserver('resize', this.handleResize.bind(this));
	this.loadResources();
}

GameScreen.prototype.loadResources = function()
{
	//load all the required resources here ...
	this._grid = new GameGrid(64, 64);
}

GameScreen.prototype.handleClick = function(vars)
{

}

GameScreen.prototype.handleResize = function(vars)
{
	this._w = vars[0];
	this._h = vars[1];
	this._grid.handleResize(this._w, this._h);
}

GameScreen.prototype.render = function(_context)
{
	_context.clearRect(0, 0, this._w, this._h)	//not required since we are filling the canvas;
	
	this._grid.render(_context);
}