//Utility functions which are accessible to all classes in this file.

var TO_RADIANS = Math.PI / 180;
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
{ 	// save the current co-ordinate system before we screw with it
	_context.save();
	// move to the middle of where we want to draw our image
	_context.translate(x, y);
	// rotate around that point, converting our angle from degrees to radians 
	_context.rotate(angle * TO_RADIANS);
 	// draw it up and to the left by half the width and height of the image 
	_context.drawImage(image, -(image.width/2), -(image.height/2));
 	// and restore the co-ords to how they were when we began
	_context.restore(); 
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
	
	if (_limited_device == 0)
	{
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
		this.buffer.width = 160;
		this.buffer.height = 120;
		this.cd = this.buffer.getContext("2d").createImageData(160, 120);
		this.fd = 0.4;
		this.ps = -4.4;
		this.ps2 = 3.3;
		var i = 512, rad = 0;
		while (i--)
		{
			rad = (i * 0.703125) * 0.0174532;
			this.aSin[i] = Math.sin(rad) * 1024;
		}
		this.runners = new Array();
		this.runners.push(100);
		this.runners.push(1);
		this.runners.push(100);
		this.runners.push(-1);
		this.runners.push(200);
		this.runners.push(-1);
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
	if (_limited_device == 0)
	{
		var cdData = this.cd.data, i = 160, j, x, idx;    
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
				var idx = (i + j * 160) * 4;

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
		this.updateRunners(0);
		this.updateRunners(2);
		this.updateRunners(4);	
	
		//render buffer onto canvas
		_context.drawImage(this.buffer,0, 0, this._w, this._h);
	}
	var _p1 = this.checkBackground(0);
	var _p2 = this.checkBackground(6);
	
	if (IsImageOk(this._bg_sprite))
		_context.drawImage(this._bg_sprite,0, 0, this._w, this._h);
	
	if (_p1)	//draw the first set of points...
	{
		_context.beginPath();
		_context.strokeStyle = "#bb0000";
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
		_context.strokeStyle = "#00bb00";
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
		var y = (this._h) - (this._sprite.height);
		if (this._hover)
			_context.drawImage(this._sprite_hover, Math.floor(x), Math.floor(y), this._sprite_hover.width, this._sprite_hover.height);
		else
			_context.drawImage(this._sprite, Math.floor(x), Math.floor(y), this._sprite.width, this._sprite.height);
	}
}

StartScreen.prototype.handleClick = function(vars)
{
	var x = (this._w / 2) - (this._sprite.width / 2);
	var y = (this._h) - (this._sprite.height);
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
	var y = (this._h) - (this._sprite.height);
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
StarField = function(numstars, z_index)
{
	this._numstars = numstars;
	this._z_index = z_index;
	this._view_w = 0;
	this._view_h = 0;
	this._stars = new Array();

	for (var i = 0; i < this._numstars * 2; i++)
		this._stars.push(0);
}

StarField.prototype.render = function(_context)
{
	var starcol = (35 + (40 * this._z_index));
	_context.strokeStyle = "rgb(" + starcol + ", " + starcol + ", " + starcol + ")";
	_context.lineCap = "round";
	_context.beginPath();

	var x, y;
	for (var i = 0; i < this._stars.length; i += 2)
	{
		x = this._stars[i + 0];
		y = this._stars[i + 1];
		_context.moveTo(x - 1, y - 1);
		_context.lineTo(x + 1, y + 1);
		_context.stroke();
	}
}

StarField.prototype.handleResize = function(w, h)
{
	this._view_w = w;
	this._view_h = h;

	for (var i = 0; i < this._stars.length; i += 2)	//we will need to reinitialize the star field here.
	{
		this._stars[i + 0] = (Math.random() * this._view_w);
		this._stars[i + 1] = (Math.random() * this._view_h);
	}
}

StarField.prototype.move = function(direction)
{
	var dx = 0; dy = 0;
	if (direction == 0)	//up
		dy = -this._z_index;
	if (direction == 1)	//right
		dx = this._z_index;
	if (direction == 2)	//down
		dy = this._z_index;
	if (direction == 3)	//left
		dx = -this._z_index;
	
	for (var i = 0; i < this._stars.length; i += 2)
	{
		this._stars[i + 0] += dx;
		this._stars[i + 1] += dy;
		
		if (this._stars[i + 0] < 0)
			this._stars[i + 0] = this._view_w;
		if (this._stars[i + 0] > this._view_w)
			this._stars[i + 0] = 0;
		if (this._stars[i + 1] < 0)
			this._stars[i + 1] = this._view_h;
		if (this._stars[i + 1] > this._view_h)
			this._stars[i + 1] = 0;
	}
}

Player = function()
{	//the player .. which will hold the sprites which control the player.
	this._x = 0;
	this._y = 0;
	this._w = 112;
	this._h = 75;
	this._view_w = 0;
	this._view_h = 0;
	this._target_dir = 0;
	this._current_dir = 0;
	this._projectile_man = new ProjectileManager('laser_1.png', (_limited_device ? 32 : 64));
	this._sprite = new Image();
	this._sprite.src = 'images/sprites/' + 'player_1.png';
}

Player.prototype.handleResize = function(w, h)
{
	this._view_w = w;
	this._view_h = h;
	this._x = (w / 2) - (this._w / 2);
	this._y = (h / 2) - (this._h / 2);
	this._projectile_man.setOculus(this._x, this._y, w, h);
}

Player.prototype.render = function(_context, dir)
{
	this._projectile_man.update(_context, this._current_dir);
	this._target_dir = (dir == 0 ? 2 : (dir == 2 ? 0 : (dir == 1 ? 3 : 1)));
	this._target_dir *= 90;
	if (IsImageOk(this._sprite))
		drawRotatedImage(_context, this._sprite, this._x, this._y, this._current_dir);
		
	var rotation_speed = 2;
	if (this._current_dir > this._target_dir)	//now handle the rotation
	{
		if (((this._current_dir >= 180) && (this._target_dir == 0)) || ((this._current_dir >=270) && (this._target_dir == 90)))
			this._current_dir += rotation_speed;
		else
			this._current_dir -= rotation_speed;
	}
	else if (this._current_dir < this._target_dir)
	{
		if ((this._current_dir) <= 90 && (this._target_dir == 270))
			this._current_dir -= rotation_speed;
		else
			this._current_dir += rotation_speed;
	}
	if (this._current_dir > 360)
		this._current_dir %= 360;
	if (this._current_dir < 0)
		this._current_dir = 360 + this._current_dir;
}

HitRect = function(x, y, w, h)
{
	this._x = x;
	this._y = y;
	this._w = w;
	this._h = h;
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

GamePad = function(handler, broadcast)
{
	this._handler = handler;
	this._broadcaster = broadcast;
	this._broadcaster.registerObserver('click', this.handleClick.bind(this));
	this._broadcaster.registerObserver('touch', this.handleClick.bind(this));
	this._broadcaster.registerObserver('resize', this.handleResize.bind(this));
	this._vw = 0;
	this._vh = 0;
	this._sprite = new Image();
	this._sprite.src = "images/dpad.png";
	this._rects = new Array();
	this._rects.push(new HitRect(0,0, 0, 0));
	this._rects.push(new HitRect(0,0, 0, 0));
	this._rects.push(new HitRect(0,0, 0, 0));
	this._rects.push(new HitRect(0,0, 0, 0));
}

GamePad.prototype.render = function(_context)
{
	if (IsImageOk(this._sprite))
		_context.drawImage(this._sprite, 0, this._vh - this._sprite.height, this._sprite.width, this._sprite.height);
}
/*
	if (vars[0] == 87)	//w
	if (vars[0] == 83)	//s
	if (vars[0] == 65)	//a
	if (vars[0] == 68)	//d
*/
GamePad.prototype.handleClick = function(_vars)
{
	if (this._rects[0].HitTest(_vars[0], _vars[1]))	//left
		this._broadcaster.broadcast("keydown", [65, 0]);
	if (this._rects[1].HitTest(_vars[0], _vars[1]))	//right
		this._broadcaster.broadcast("keydown", [68, 0]);
	if (this._rects[2].HitTest(_vars[0], _vars[1]))	//up
		this._broadcaster.broadcast("keydown", [87, 0]);
	if (this._rects[3].HitTest(_vars[0], _vars[1]))	//down
		this._broadcaster.broadcast("keydown", [83, 0]);
}

GamePad.prototype.handleResize = function(_vars)
{
	this._vw = _vars[0];
	this._vh = _vars[1];
	
	this._rects = new Array();
	this._rects.push(new HitRect(0, this._vh - (28 + 72), 28, 72));	//left
	this._rects.push(new HitRect(128 - 28, this._vh - (28 + 72), 28, 72));	//right
	this._rects.push(new HitRect(28, this._vh - 128, 72, 28));	//top
	this._rects.push(new HitRect(28, this._vh - 28, 72, 28));	//bottom
}

Radar = function(_broadcaster)
{
	this._broadcaster = _broadcaster;
	this._world_w = 192000;	//width and height of the actual world
	this._world_h = 108000;
	this._world_scale_x = 0;
	this._world_scale_y = 0;
	this._display_w = 0;
	this._display_h = 0;
	
	this._view_x = 0;
	this._view_y = 0;
	this._view_w = 0;
	this._view_h = 0;
	this._current_dir = 0;
	this._broadcaster.registerObserver("direction", this.handleDirChange.bind(this));
	
	this._world_points = new Array();	//x and y pairs
	
	this._world_points.push(this._view_x);	//this is the center_x
	this._world_points.push(this._view_y);	//this is the center_y
	
	this._canvas = document.createElement("canvas");	//use offscreen canvas to accomplish rendering.
}

Radar.prototype.handleDirChange = function(_vars)
{
	this._current_dir = _vars[0];
}

Radar.prototype.addWorldPoint = function(x, y)
{
	this._world_points.push(x);//x
	var _ret = this._world_points.length;	//return the length at the point where x was inserted.
	this._world_points.push(y);//y
	return ret;
}

Radar.prototype.addWorldTransform(w, h)
{
	this._view_w = w;
	this._view_h = h;
	this._display_w = (w < 640 ? (w / 2) : (w / 4));
	this._display_h = (h < 480 ? (h / 2) : (h / 4));

	this._world_scale_x = (1 / this._world_w) * this._display_w;
	this._world_scale_y = (1 / this._world_h) * this._display_h;
	
	this._canvas.width = this._display_w;
	this._canvas.height = this._display_h;
	this._canvas.clientWidth = this._display_w;
	this._canvas.clientHeight = this._display_h;
}

Radar.prototype.render = function(_context)
{	//update the coordinates based on the game direction...
	//render the radar as pixels, need to find nice looking radar.
	//not sure how we will gather all enemies' coordinates...
	
	//For now we just focus on rendering the ship coordinates relative to the world.
	var _ctx = this._canvas.getContext("2d");
	_ctx.fillStyle = "#000000";
	_ctx.fillRect(0, 0, this._display_w, this._display_h);

	_ctx.strokeStyle = "rgb(255, 255, 255)";
	_ctx.lineCap = "round";
	_ctx.beginPath();
	var hitrect = new HitRect(this._view_x, this._view_y, this._view_w, this._view_h);
	var t_x = 0, t_y = 0;
	for (var i = 0; i < this._world_points.length; i += 2)
	{	//x = [i + 0], y = [i + 1]
		if (hitrect.HitTest(this._world_points[i + 0], this._world_points[i + 1]))
		{	//the point is within the world ... now we render the point.
			t_x = this._world_points[i + 0] * this._world_scale_x;
			t_y = this._world_points[i + 1] * this._world_scale_y;
			
			//Now draw the point.
			_ctx.moveTo(t_x, t_y);
			_ctx.lineTo(t_x + 1, t_y + 1);
			_ctx.stroke();
		}
	}
	///blit with ctx
	_context.drawImage(this._canvas, 0, 0, this._display_w, this._display_h);	//for now we will render the context at the top-left.
	//remove the added world points so that they may be transformed by the main transformation function ...
	//might need to think about this a little more.
}

GameScreen = function(_handler, _broadcaster)
{
	this._handler = _handler;
	this._broadcaster = _broadcaster;
	this._stars = new Array();
	this._w = 0;
	this._h = 0;
	this._player = 0;
	this._direction = 2;
	this._game_controls = 0;
	this._radar = new Radar(_broadcaster);

	this._broadcaster.registerObserver('click', this.handleClick.bind(this));
	this._broadcaster.registerObserver('resize', this.handleResize.bind(this));
	this._broadcaster.registerObserver('keydown', this.handleKey.bind(this));
	this.loadResources();
}

GameScreen.prototype.loadResources = function()
{	//load all the required resources here ...
	if (_limited_device || _mobile_device)
	{
		for (var i = 0; i < 1; i++)
			this._stars[i] = new StarField(32, (i + 1) * 2);
	}
	else
	{
		for (var i = 0; i < 3; i++)
		this._stars[i] = new StarField(64, (i + 1) * 2);
	}
	if (_mobile_device)	//show touchpad for mobile devices.
		this._game_controls = new GamePad(this._handler, this._broadcaster);
	this._player = new Player();
	this._broadcaster.broadcast("direction", [this._direction, 0]);
}

GameScreen.prototype.handleClick = function(vars)
{

}

GameScreen.prototype.handleKey = function(vars)
{
	if (vars[0] == 87)	//w
		this._direction = 2;
	if (vars[0] == 83)	//s
		this._direction = 0;
	if (vars[0] == 65)	//a
		this._direction = 1;
	if (vars[0] == 68)	//d
		this._direction = 3;
		
	this._broadcaster.broadcast("direction", [this._direction, 0]);
}

GameScreen.prototype.handleResize = function(vars)
{
	this._w = vars[0];
	this._h = vars[1];
	for (var i = 0; i < this._stars.length; i++)
		this._stars[i].handleResize(this._w, this._h);
	this._player.handleResize(this._w, this._h);
	this._radar.addWorldTransform(this._w, this._h);
}

GameScreen.prototype.render = function(_context)
{
	_context.clearRect(0, 0, this._w, this._h)	//not required since we are filling the canvas;
	
	for (var i = 0; i < this._stars.length; i++)
	{
		this._stars[i].move(this._direction);
		this._stars[i].render(_context);
	}
	
	this._player.render(_context, this._direction);
	if (this._game_controls != 0)
		this._game_controls.render(_context);
	
	this._radar.render(_context);
	
	if (_debug_mobile)
	{	//now we render debug info.
		_context.fillStyle = "#ff0000";
		_context.font = "20px Georgia";
		_context.fillText("Ship direction[" + this._player._current_dir + "] target[" + this._player._target_dir + "]", 10, 20);
		_context.fillText("Browser[" + navigator.userAgent + "]", 10, 40);
	}
}