//Utility functions which are accessible to all classes in this file.

var TO_RADIANS = Math.PI / 180;

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
	
	//render buffer onto canvas
	_context.drawImage(this.buffer,0, 0, this._w, this._h);

	this.updateRunners(0);
	this.updateRunners(2);
	this.updateRunners(4);
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

StarField = function(numstars, z_index)
{
	this._numstars = numstars;
	this._z_index = z_index;
	this._view_w = 0;
	this._view_h = 0;

	this._stars = new Array();
	for (var i = 0; i < this._numstars * 2; i++)
	{
		var dummy = 0;
		this._stars.push(dummy);
	}
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
	
	//we will need to reinitialize the star field here.
	for (var i = 0; i < this._stars.length; i += 2)
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
	this._sprites = new Array();
	//we will be able to fire 64 projectiles. These will be reused as they reach the edge of the screen
	this._projectiles = new Array();
	this._x = 0;
	this._y = 0;
	this._w = 112;
	this._h = 75;
	this._view_w = 0;
	this._view_h = 0;
	this._projectile_timer = 50;	//we will fire one projectile every 10 frames (3 projectiles per second)
	this._target_dir = 0;
	this._current_dir = 0;
	this._oculus = new Array();
	this._oculus.push(0);
	this._oculus.push(0);
	this._radius = 200;
	this._projectile_speed = 25;
	
	var sources = ['player_1.png', 'laser_1.png'];
	for (var i = 0; i < 2; i++)
	{
		this._sprites.push(new Image());
		this._sprites[i].src = 'images/sprites/' + sources[i];
	}
	for (var i = 0; i < 384; i++)	//x, y, angle, alive
		this._projectiles.push(0);	//push dummy value into array to get the correct number of variables to describe each projectile
}

Player.prototype.handleResize = function(w, h)
{
	this._view_w = w;
	this._view_h = h;
	this._x = (w / 2) - (this._w / 2);
	this._y = (h / 2) - (this._h / 2);
	this._oculus[0] = this._x;
	this._oculus[1] = this._y + this._radius;
}

Player.prototype.render = function(_context, dir)
{
	this._projectile_timer--;
	if (this._projectile_timer == 0)
	{	//time to fire a new projectile
		for (var i = 0; i < 64; i += 6)
		{
			if (this._projectiles[i + 3] != 1)	//we have found a dead projectile, fire it.
			{
				this._projectiles[i + 0] = this._x - 8;
				this._projectiles[i + 1] = this._y - 8;
				this._projectiles[i + 2] = this._current_dir;
				this._projectiles[i + 3] = 1;

				var radians = this._current_dir * TO_RADIANS;
				var ct = Math.cos(radians);
				var st = Math.sin(radians);

				var _rotated_X = (ct * (this._oculus[0] - this._x) - st * (this._oculus[1] - this._y)) + this._x;//(cos * (x - cx)) - (sin * (y - cy)) 
				var _rotated_Y = (st * (this._oculus[0] - this._x) + ct * (this._oculus[1] - this._y)) + this._y;//(sin * (x - cx)) + (cos * (y - cy))
				
				var P = new Vector(this._x, this._y);
				var B = new Vector(_rotated_X, _rotated_Y);
				var PB = P.subtract(B);
				var _delta = PB.divide(this._projectile_speed);
				
				this._projectiles[i + 4] = _delta._x;
				this._projectiles[i + 5] = _delta._y;

				break;
			}
		}
		this._projectile_timer = 6;
	}
	this.updateProjectiles(_context);
	
	this._target_dir = (dir == 0 ? 2 : (dir == 2 ? 0 : (dir == 1? 3 : 1)));
	this._target_dir *= 90;
	if (IsImageOk(this._sprites[0]))
		drawRotatedImage(_context, this._sprites[0], this._x, this._y, this._current_dir);
		
	//now handle the rotation
	var rotation_speed = 2;
	if (this._current_dir > this._target_dir)
	{
		if (((this._current_dir >= 180) && (this._target_dir == 0)) || ((this._current_dir >=270) && (this._target_dir == 90)))
			this._current_dir += rotation_speed;
		else
			this._current_dir -= rotation_speed;
	}
	else if (this._current_dir < this._target_dir)
	{
		if((this._current_dir) <= 90 && (this._target_dir == 270))
			this._current_dir -= rotation_speed;
		else
			this._current_dir += rotation_speed;
	}
	if (this._current_dir > 360)
		this._current_dir %= 360;
	if (this._current_dir < 0)
		this._current_dir = 360 + this._current_dir;
}

Player.prototype.updateProjectiles = function(_context)
{
	for (var i = 0; i < 64; i += 6)
	{
		if (this._projectiles[i + 3] != 0)	//only update if it's alive
		{	//now move the projectile along its path.
			var draw = 1;
			if ((this._projectiles[i + 0] < 0) || (this._projectiles[i + 0] > this._view_w))
				draw = 0;
			if ((this._projectiles[i + 1] < 0) || (this._projectiles[i + 1] > this._view_h))
				draw = 0;

			if (draw)
				_context.drawImage(this._sprites[1], this._projectiles[i + 0], this._projectiles[i + 1], 16, 16);
			else
				this._projectiles[i + 3] = 0;

			this._projectiles[i + 0] += this._projectiles[i + 4];;
			this._projectiles[i + 1] += this._projectiles[i + 5];
		}
	}
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
	
	this._broadcaster.registerObserver('click', this.handleClick.bind(this));
	this._broadcaster.registerObserver('resize', this.handleResize.bind(this));
	this._broadcaster.registerObserver('keydown', this.handleKey.bind(this));
	this.loadResources();
}

GameScreen.prototype.loadResources = function()
{	//load all the required resources here ...
	for (var i = 0; i < 3; i++)
		this._stars[i] = new StarField(64, (i + 1) * 2);
	this._player = new Player();
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
}

GameScreen.prototype.handleResize = function(vars)
{
	this._w = vars[0];
	this._h = vars[1];
	for (var i = 0; i < this._stars.length; i++)
		this._stars[i].handleResize(this._w, this._h);
	this._player.handleResize(this._w, this._h);
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
	
	//now we render debug info.
	_context.fillStyle = "#ff0000";
	_context.font = "20px Georgia";
	_context.fillText("Ship direction[" + this._player._current_dir + "] target[" + this._player._target_dir + "]", 10, 20);
}