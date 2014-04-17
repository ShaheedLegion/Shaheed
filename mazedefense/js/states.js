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
	this._sprite_hover = new Image();
	this._sprite.src = "images/button_play.png";
	this._sprite_hover.src = "images/button_play_hover.png";
	this._bg_sprite = new Image();
	this._bg_sprite.src = "images/start_bg.png";
	
	this._audio = new Audio();
	this._audio.src = "sounds/lost.ogg";
	this._audio.onloadeddata = this.playAudio.bind(this);
	this._audio.ended = this.playAudio.bind(this);
	this._w = 0;
	this._h = 0;
	this._hover = 0;

	
	this._broadcaster.registerObserver('click', this.handleClick.bind(this));
	this._broadcaster.registerObserver('move', this.handleMove.bind(this));
	this._broadcaster.registerObserver('resize', this.handleResize.bind(this));
	
	this._data_points = new Array();	//set up the data points for the background effect.
	for (var i = 0; i < 12; i++)
		this._data_points.push(-1);// dammit opera...

	if (!("createImageData" in CanvasRenderingContext2D.prototype))
	{
		CanvasRenderingContext2D.prototype.createImageData = function(sw,sh) { return this.getImageData(0,0,sw,sh);}
	}
	
	this.p1 = 0,
	this.p2 = 0,
	this.p3 = 0,
	this.p4 = 0,
	this.t1 = 0;
	this.t2 = 0;
	this.t3 = 0
	this.t4 = 0
	this.aSin = [];
	this.ti = 15;
	this.buffer = document.createElement('canvas');
	this.buffer.width = 320;
	this.buffer.height = 240;
	this.cd = this.buffer.getContext("2d").createImageData(320, 240);
	this.fd = 0.4;
	this.ps = -4.4;
	this.ps2 = 3.3;
	this.runners = new Array();
	
	this.runners.push(100);
	this.runners.push(1);
	this.runners.push(100);
	this.runners.push(-1);
	this.runners.push(200);
	this.runners.push(-1);

	var i = 512, rad = 0;
	while (i--)
	{
		rad = (i * 0.703125) * 0.0174532;
		this.aSin[i] = Math.sin(rad) * 1024;
	}
}

StartScreen.prototype.playAudio = function()
{
	this.currentTime = this.startTime;
	this._audio.play();
}

StartScreen.prototype.updateRunners = function(runner_offset)
{
	if (this.runners[1 + runner_offset] > 0) this.runners[0 + runner_offset] += 1;
	if (this.runners[1 + runner_offset] < 0) this.runners[0 + runner_offset] -= 1;
	if (this.runners[0 + runner_offset] > 250) this.runners[1 + runner_offset] = -1;
	if (this.runners[0 + runner_offset] < 5) this.runners[1 + runner_offset] = 1;
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
	if (IsImageOk(this._bg_sprite))
		_context.drawImage(this._bg_sprite,0, 0, this._w, this._h);

	var cdData = this.cd.data, i = 320, j, x, idx;    
	this.t4 = this.p4;
	this.t3 = this.p3;

	while (i--)
	{
		this.t1 = this.p1 + 5;
		this.t2 = this.p2 + 3;
		this.t3 &= 511;
		this.t4 &= 511;
		j = 240;
		while (j--)
		{
			this.t1 &= 511;
			this.t2 &= 511;
			x = this.aSin[this.t1] + this.aSin[this.t2] + this.aSin[this.t3] + this.aSin[this.t4];
			var idx = (i + j * 320) * 4;

			cdData[idx] = x/2.6;	//as = 2.6
			cdData[idx + 1] = this.runners[0];
			cdData[idx + 2] = this.runners[2];
			cdData[idx + 3] = 155;

			this.t1 += 5;
			this.t2 += 3;
		}

		this.t4 += 4.4;	//as1 = 4.4
		this.t3 += 2.2;	//fd1 = 2.2
	}

	this.cd.data = cdData;    

	this.buffer.getContext("2d").putImageData(this.cd, 0, 0, 0, 0, this._w, this._h);

	this.p1 += this.ps;
	this.p3 += this.ps2;
	
	//render buffer onto canvas
	_context.drawImage(this.buffer,0, 0, this._w, this._h);

	this.updateRunners(0);
	this.updateRunners(2);
	this.updateRunners(4);
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
	if (IsImageOk(this._sprite) && IsImageOk(this._sprite_hover))
	{
		var x = (this._w / 2) - (this._sprite.width / 2);
		var y = (this._h / 2) - (this._sprite.height / 2);
		if (this._hover)
			_context.drawImage(this._sprite_hover, Math.floor(x), Math.floor(y), this._sprite_hover.width, this._sprite_hover.height);
		else
			_context.drawImage(this._sprite, Math.floor(x), Math.floor(y), this._sprite.width, this._sprite.height);
	}
}

StartScreen.prototype.handleClick = function(vars)
{
	var x = (this._w / 2) - (this._sprite.width / 2);
	var y = (this._h / 2) - (this._sprite.height / 2);
	if (vars[0] > x && vars[1] > y)
	{
		if (vars[0] < (x + this._sprite.width) && vars[1] < (y + this._sprite.height))
			this._broadcaster.broadcast('StartScreenClick', vars);
	}
}

StartScreen.prototype.handleMove = function(vars)
{
	this._hover = 0;
	var x = (this._w / 2) - (this._sprite.width / 2);
	var y = (this._h / 2) - (this._sprite.height / 2);
	if (vars[0] > x && vars[1] > y)
	{
		if (vars[0] < (x + this._sprite.width) && vars[1] < (y + this._sprite.height))
			this._hover = 1;
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