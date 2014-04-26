
StartScreen = function(_handler, _broadcaster, _world)
{
	this._handler = _handler;
	this._broadcaster = _broadcaster;
	this._sprite = new Image();
	this._sprite_hover = new Image();
	this._sprite.src = "images/button_play.png";
	this._sprite_hover.src = "images/button_play_hover.png";
	this._bg_sprite = new Image();
	this._bg_sprite.src = "images/start_bg.png";
	
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

StartScreen.prototype.update = function()
{

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
	_context.fillStyle = "rgb(" + starcol + ", " + starcol + ", " + starcol + ")";

	var x, y;
	for (var i = 0; i < this._stars.length; i += 2)
	{
		x = Math.floor(this._stars[i + 0]);
		y = Math.floor(this._stars[i + 1]);
		_context.fillRect(x, y, 1, 1);
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
	this._h = 112;
	this._view_w = 0;
	this._view_h = 0;
	this._target_dir = 0;
	this._current_dir = 0;
	this._projectile_man = new ProjectileManager('laser_1.png', (_limited_device ? 32 : 64));
	this._sprite = new Image();
	this._sprite.src = 'images/sprites/' + 'player_1.png';
	
	this._shield_max = 10;	//for starters, this will increase with power ups.
	this._shield = this._shield_max;
	this._lives = this._shield_max;	//for starters, changes during gameplay
	this._hit_rects = [];	//set to array so that we can immediately run hit testing.
	this._explosion = new Explosion();
	this._exploding = 0;
}

Player.prototype.handleResize = function(w, h)
{
	this._view_w = w;
	this._view_h = h;
	this._x = (w / 2);
	this._y = (h / 2);
	this._projectile_man.setOculus(this._x, this._y, w, h);
}

Player.prototype.render = function(_context, dir)
{
	this._projectile_man.render(_context);
	if (IsImageOk(this._sprite))
		drawRotatedImage(_context, this._sprite, this._x, this._y, this._current_dir);
		
	if (this._lives > 0)
	{
		_context.strokeStyle = "rgb(0, " + ((100 + (155 / this._shield_max) * this._shield)) + ", 0)";
		_context.beginPath();
		_context.arc(this._x, this._y, 70, 0, Math.PI * 2, true); 
		_context.closePath();
		_context.stroke();
		
		//Now we draw the player ships left, and the shield bar.
		var shield_bar_w = (this._view_w / 4) -  1;
		var shield_bar_h = 40;	//40 pixels should be enough.
		var shield_bar_y = (this._view_h / 4) + 1;	//move it slightly away from the mini-map
		var current_shield_w = (shield_bar_w / this._shield_max) * this._shield;
		var current_lives_w = (shield_bar_w / this._shield_max) * this._lives;

		_context.strokeStyle = "#00FF00";
		_context.fillStyle = "#00FF00";
		fillRect(_context, 0, shield_bar_y, current_shield_w, shield_bar_h);
		drawRect(_context, 0, shield_bar_y, shield_bar_w, shield_bar_h);

		_context.strokeStyle = "#0000FF";
		_context.fillStyle = "#0000FF";
		fillRect(_context, 0, shield_bar_y + shield_bar_h, current_lives_w, shield_bar_h);
		drawRect(_context, 0, shield_bar_y + shield_bar_h, shield_bar_w, shield_bar_h);
	}
}

Player.prototype.update = function(dir)
{
	this._projectile_man.update(this._current_dir);
	this._target_dir = (dir == 0 ? 2 : (dir == 2 ? 0 : (dir == 1 ? 3 : 1)));
	this._target_dir *= 90;

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
		_context.drawImage(this._sprite, 0, this._vh - this._sprite.height, this._sprite.width, this._sprite.height);this._shield_max = 10;	//for starters, this will increase with power ups.
}

GamePad.prototype.handleClick = function(_vars)
{
	if (this._rects[0].HitTest(_vars[0], _vars[1]))	//left
		this._broadcaster.broadcast("keydown", [65, 0]);	//a
	if (this._rects[1].HitTest(_vars[0], _vars[1]))	//right
		this._broadcaster.broadcast("keydown", [68, 0]);	//d
	if (this._rects[2].HitTest(_vars[0], _vars[1]))	//up
		this._broadcaster.broadcast("keydown", [87, 0]);	//w
	if (this._rects[3].HitTest(_vars[0], _vars[1]))	//down
		this._broadcaster.broadcast("keydown", [83, 0]);	//s
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

Radar = function(_broadcaster, _world)
{
	this._broadcaster = _broadcaster;
	this._world = _world;
	this._canvas = document.createElement("canvas");	//use offscreen canvas to accomplish rendering.
}

Radar.prototype.addWorldTransform = function(w, h)
{
	this._display_w = w / 4;//(w < 640 ? (w / 2) : (w / 4));
	this._display_h = h / 4;//(h < 480 ? (h / 2) : (h / 4));

	this._canvas.width = this._display_w;
	this._canvas.height = this._display_h;
	this._canvas.clientWidth = this._display_w;
	this._canvas.clientHeight = this._display_h;
}

Radar.prototype.render = function(_context)
{
	//For now we just focus on rendering the ship coordinates relative to the world.
	var _ctx = this._canvas.getContext("2d");
	_ctx.fillStyle = "#000000";
	_ctx.fillRect(0, 0, this._display_w, this._display_h);

	this._world.renderScaledView(_ctx, this._display_w, this._display_h);
	_context.drawImage(this._canvas, 0, 0, this._display_w, this._display_h);	//for now we will render the context at the top-left.
}

Explosion = function()
{
	//load up the sprite and the animation here ... set some defaults then get ready to render!!!!
	this._visible = 0;
	this._px = 0;
	this._py = 0;
	
	this._sprite = new Image();
	this._sprite.src = "images/explosion.png";
	this._sprite.onload = this.loaded.bind(this);
	this._current_frame = 0;
	this._numframes = 0;
	this._frame_delay_timer = 10;
	this._frame_delay = this._frame_delay_timer;
}
Explosion.prototype.loaded = function()
{
	this._numframes = (this._sprite.width / this._sprite.height);
}
Explosion.prototype.visible = function() {return this._visible;}
Explosion.prototype.setvisible = function(vec)
{
	this._visible = 1;
	this._px = vec[0];
	this._py = vec[1];

}
Explosion.prototype.render = function(_context)
{
	if (this.visible() && IsImageOk(this._sprite))
	{
		//_context.drawImage(this._sprite, 0, 0);
		var _current_x = (this._current_frame * this._sprite.height);
		_context.drawImage(this._sprite, _current_x, 0, this._sprite.height, this._sprite.height, this._px, this._py, this._sprite.height, this._sprite.height);
		
		this._frame_delay--;
		if (this._frame_delay <= 0)
		{
			this._current_frame++;
			this._frame_delay = this._frame_delay_timer;
		}
		if (this._current_frame >= this._numframes)
			this._visible = false;
	}
}

Enemy = function(name, world)
{
	this._world = world;
	var x = Math.random() * this._world.getDimensions()._x;
	var y = Math.random() * this._world.getDimensions()._y;
	
	//let us assume the enemy sprite dimensions fit within the radius, then the radius would be something like 500px
	var radius = 500;
	var dir = (Math.random() * 300) + 60;	//somewhere inside of 360 degrees
	var PB = rotateAroundPoint(x, y, radius, dir);
	var _delta = PB.divide(200);	//random speed
	this._idx = this._world.addWorldPoint(x, y, _delta._x, _delta._y);
	
	this._sprite = new Image();
	this._sprite.onload = this.updatePointDims.bind(this);
	this._sprite.src = name;
	
	this._explosion = new Explosion();
	this._exploding = 0;
}

Enemy.prototype.updatePointDims = function()
{
	var w = this._sprite.width;
	var h = this._sprite.height;
	
	this._world.setPointDims(this._idx, w, h);	//this is used in the point-in-view calculation
}

Enemy.prototype.render = function(_context)
{
	if (this._world.pointInViewport(this._idx))
	{
		var vp = this._world.getViewPoint(this._idx);
		if (this._explosion.visible())
		{
			this._explosion.render(_context);
		}
		else if (!this._exploding)
		{
			_context.drawImage(this._sprite, vp[0], vp[1], this._sprite.width, this._sprite.height);
		}
	}
}

//These functions are (sensibly) grouped together because they handle a similar task.
Enemy.prototype.handleCollision = function()
{
	//the enemy was hit by something ... do something about it.
	if (this._exploding)
		return;

	//instantiate explosion...
	this._explosion.setvisible(this._world.getViewPoint(this._idx));
	this._exploding = 1;
	this._world.setAlive(this._idx, 0);
}

Player.prototype.handleCollision = function()
{
	//the player was hit by something ... do something about it
	if (this._explosion.visible())	//don't handle collisions with explosion animations
		return;
	this._shield--;
	if (this._shield < 0)
	{
		this._lives--;
		if (this._lives == 0)
		{
			this._explosion.setvisible([this._x, this._y]);
		}
		else
			this._shield = this._shield_max;
	}
}

GameScreen = function(_handler, _broadcaster, _world)
{
	this._handler = _handler;
	this._broadcaster = _broadcaster;
	this._game_world = _world;
	this._stars = new Array();
	this._w = 0;
	this._h = 0;
	this._player = 0;
	this._direction = 2;
	this._game_controls = 0;
	this._radar = new Radar(_broadcaster, _world);

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
	this._game_world.setPlayerDims(this._player._w, this._player._h);
	this._broadcaster.broadcast("direction", [this._direction, 0]);
	
	this._enemies = new Array();
	
	var enemysprites = ["images/sprites/enemy_1.png", "images/sprites/enemy_2.png", "images/sprites/enemy_3.png"];
	
	for (var i = 0; i < 120; i++)
	{
		var idx = Math.floor(Math.random() * enemysprites.length);
		var enemy = new Enemy(enemysprites[idx], this._game_world);
		this._enemies.push(enemy);
	}
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

GameScreen.prototype.update = function()
{
	for (var i = 0; i < this._stars.length; i++)
	{
		this._stars[i].move(this._direction);
	}
	this._player.update(this._direction);
	var player_hit_rects = this._game_world.HitTestPlayer();
	
	if (player_hit_rects.length)
	{
		for (var idx = 0; idx < player_hit_rects.length; idx++)
		{
			for (var i = 0; i < this._enemies.length; i++)
			{
				if (this._enemies[i]._idx == player_hit_rects[idx])
				{
					if (!this._enemies[i]._exploding)
						this._player.handleCollision();
						this._enemies[i].handleCollision();
					//var ep = this._game_world.getViewPoint(this._enemies[i]._idx);
					//console.log("ex[" + ep[0] + "] ey[" + ep[1] + "] ew[" + this._enemies[i]._sprite.width + "] eh[" + this._enemies[i]._sprite.height + "]");
				}
			}
		}
	}
	
	var enemy_hit_rects = this._player._projectile_man.HitTestEnemies(this._game_world, this._enemies);
	if (enemy_hit_rects.length)
	{
		for (var idx = 0; idx < enemy_hit_rects.length; idx++)
		{
			for (var i = 0; i < this._enemies.length; i++)
			{
				if (this._enemies[i]._idx == enemy_hit_rects[idx])
				{
					this._enemies[i].handleCollision();
				}
			}
		}
	}
}

GameScreen.prototype.render = function(_context)
{
	_context.clearRect(0, 0, this._w, this._h)	//not required since we are filling the canvas;

	for (var i = 0; i < this._stars.length; i++)
	{
		this._stars[i].render(_context);
	}

	this._player.render(_context);
	_context.strokeStyle = "#00FF00";
	//drawRect(_context, this._game_world.player_rect._x, this._game_world.player_rect._y, this._game_world.player_rect._w, this._game_world.player_rect._h);

	for (var i = 0; i < this._enemies.length; i++)
	{
		this._enemies[i].render(_context);
	}

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