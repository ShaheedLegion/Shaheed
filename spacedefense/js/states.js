
StartScreen = function(_handler, _broadcaster, _world, _font)
{
	this._handler = _handler;
	this._broadcaster = _broadcaster;
	this._sprite = new Image();
	this._sprite_hover = new Image();
	this._sprite.src = "images/button_play.png";
	this._sprite_hover.src = "images/button_play_hover.png";
	this._font_r = _font;
	
	this._broadcaster.registerObserver('click', this.handleClick.bind(this));
	this._broadcaster.registerObserver('move', this.handleMove.bind(this));
	this._broadcaster.registerObserver('resize', this.handleResize.bind(this));
	
	this._data_points = new Array();	//set up the data points for the background effect.
	for (var i = 0; i < 12; i++)
		this._data_points.push(-1);

/*
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
	}*/
}

StartScreen.prototype._w = 0;
StartScreen.prototype._h = 0;
StartScreen.prototype._hover = 0;

/*
StartScreen.prototype.updateRunners = function(runner_offset)
{
	if (this.runners[1 + runner_offset] > 0) this.runners[0 + runner_offset] += 1;
	if (this.runners[1 + runner_offset] < 0) this.runners[0 + runner_offset] -= 1;
	if (this.runners[0 + runner_offset] > 250) this.runners[1 + runner_offset] = -1;
	if (this.runners[0 + runner_offset] < 5) this.runners[1 + runner_offset] = 1;
}
*/
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
/*
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
				cdData[idx + 3] = 255;

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
*/
	var _p1 = this.checkBackground(0);
	var _p2 = this.checkBackground(6);
	
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
	
	this._font_r.setBounds(this._w, this._h);
	var start_point = (this._h / 2) - (this._font_r._letter_height * 4);
	this._font_r.renderTextScaled(_context, "Welcome to", -1, start_point, 0.75);
	
	start_point += (this._font_r._letter_height);
	this._font_r.renderText(_context, "SPACEDEFENSE", -1, start_point);
	start_point += (this._font_r._letter_height);
	this._font_r.renderText(_context, "Keys: W,A,S,D", -1, start_point);
	start_point += (this._font_r._letter_height);
	this._font_r.renderText(_context, "Or arrow keys", -1, start_point);
	start_point += (this._font_r._letter_height);
	this._font_r.renderTextScaled(_context, "By Shaheed Abdol", -1, start_point, 0.75);
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
GamePad = function(handler, broadcast)
{
	this._handler = handler;
	this._broadcaster = broadcast;
	this._broadcaster.registerObserver('click', this.handleClick.bind(this));
	this._broadcaster.registerObserver('touch', this.handleClick.bind(this));
	this._broadcaster.registerObserver('resize', this.handleResize.bind(this));

	this._sprite = new Image();
	this._sprite.src = "images/dpad.png";
	this._rects = new Array();
	this._rects.push(new HitRect(0,0, 0, 0));
	this._rects.push(new HitRect(0,0, 0, 0));
	this._rects.push(new HitRect(0,0, 0, 0));
	this._rects.push(new HitRect(0,0, 0, 0));
}

GamePad.prototype._vw = 0;
GamePad.prototype._vh = 0;

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

GameScreen = function(_handler, _broadcaster, _world, _font)
{
	this._handler = _handler;
	this._broadcaster = _broadcaster;
	this._game_world = _world;
	this._stars = new Array();
	this._radar = new Radar(_broadcaster, _world);
	this._font_r = _font;

	this._broadcaster.registerObserver('click', this.handleClick.bind(this));
	this._broadcaster.registerObserver('resize', this.handleResize.bind(this));
	this._broadcaster.registerObserver('keydown', this.handleKey.bind(this));
	this.loadResources();
}

GameScreen.prototype._w = 0;
GameScreen.prototype._h = 0;
GameScreen.prototype._player = 0;
GameScreen.prototype._direction = 2;
GameScreen.prototype._game_controls = 0;

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
	this._player = new Player(120);
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
	
	this._shield_bar = new Image();
	this._lives_bar = new Image();
	this._indicator = new Image();
	
	this._shield_bar.src = "images/shield_bar.png";
	this._lives_bar.src = "images/lives_bar.png";
	this._indicator.src = "images/indicator.png";
}

GameScreen.prototype.handleClick = function(vars)
{

}

GameScreen.prototype.handleKey = function(vars)
{
	if (vars[0] == 87 || vars[0] == 38)	//w, up arrow
		this._direction = 2;
	if (vars[0] == 83 || vars[0] == 40)	//s, down arrow
		this._direction = 0;
	if (vars[0] == 65 || vars[0] == 37)	//a, left arrow
		this._direction = 1;
	if (vars[0] == 68 || vars[0] == 39)	//d, right arrow
		this._direction = 3;
		
	this._broadcaster.broadcast("direction", [this._direction, 0]);
}

GameScreen.prototype.handleResize = function(vars)
{
	this._w = vars[0];
	this._h = vars[1];
	var stars = this._stars.length
	for (var i = 0; i < stars; i++)
		this._stars[i].handleResize(this._w, this._h);
	this._player.handleResize(this._w, this._h);
	this._radar.addWorldTransform(this._w, this._h);
}

GameScreen.prototype.update = function()
{
	var stars = this._stars.length;
	var enemylen = this._enemies.length;
	for (var i = 0; i < stars; i++)
	{
		this._stars[i].move(this._direction);
	}
	this._player.update(this._direction);
	var player_hit_rects = this._game_world.HitTestPlayer();
	var play_hit_len = player_hit_rects.length;
	if (play_hit_len)
	{
		for (var idx = 0; idx < play_hit_len; idx++)
		{
			for (var i = 0; i < enemylen; i++)
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
	
	for (var i = 0; i < enemylen; i++)
	{	//for now we don't do a test to eliminate possible hit testing, we just run it all and see what happens.
		var enemy_player_hits = this._enemies[i]._projectile_man.HitTestPlayer(this._game_world, this._player);
		if (enemy_player_hits.length)
		{	//break out early, in the best case scenario we hit test maybe O^n-1 times.
			this._player.handleCollision();	//can only explode once per collision.
			break;
		}
	}
	
	var enemy_hit_rects = this._player._projectile_man.HitTestEnemies(this._game_world, this._enemies);
	var enemy_hit_length = enemy_hit_rects.length
	if (enemy_hit_length)
	{
		for (var idx = 0; idx < enemy_hit_length; idx++)
		{
			for (var i = 0; i < enemylen; i++)
			{
				if (this._enemies[i]._idx == enemy_hit_rects[idx])
				{
					if (this._enemies[i].handleCollision())
						this._player.updateScore();
				}
			}
		}
	}
	
	var total_enemies = 0;
	for(var i = 0; i < enemylen; i++)
	{
		if (!this._enemies[i]._exploding)
			total_enemies++;
	}
	this._player.setEnemies(total_enemies);
}

GameScreen.prototype.render = function(_context)
{
	_context.clearRect(0, 0, this._w, this._h)	//not required since we are filling the canvas;

	var stars = this._stars.length;
	for (var i = 0; i < stars; i++)
	{
		this._stars[i].render(_context);
	}

	var enemies = this._enemies.length;
	for (var i = 0; i < enemies; i++)
	{
		this._enemies[i].render(_context);
	}

	if (this._game_controls != 0)
		this._game_controls.render(_context);

	this._player.render(_context, this._font_r);
	this._radar.render(_context);

	//Now we draw the player ships left, and the shield bar.
	var shield_bar_w = this._radar.getRadarWidth();
	var shield_bar_h = 40;	//40 pixels should be enough.
	var shield_bar_y = this._radar.getRadarHeight() + 1;	//move it slightly away from the mini-map
	var current_shield_w = (shield_bar_w / this._player._shield_max) * this._player._shield;
	var current_lives_w = (shield_bar_w / this._player._shield_max) * this._player._lives;

	_context.drawImage(this._shield_bar, 0, shield_bar_y, this._shield_bar.width, this._shield_bar.height);
	
	var shield = this._player._shield
	for (var i = 0; i < shield; i++)
		_context.drawImage(this._indicator, 5 + (i * (this._indicator.width + 0)), shield_bar_y + 4, this._indicator.width, this._indicator.height);
	
	this._font_r.renderTextScaledCentered(_context, "SHIELD", shield_bar_w, shield_bar_y + 2, 0.75);

	_context.drawImage(this._lives_bar, 0, shield_bar_y + shield_bar_h, this._lives_bar.width, this._lives_bar.height);

	var lives = this._player._lives;
	for (var i = 0; i < lives; i++)
		_context.drawImage(this._indicator, 5 + (i * (this._indicator.width + 0)), shield_bar_y + shield_bar_h + 4, this._indicator.width, this._indicator.height);
	
	this._font_r.renderTextScaledCentered(_context, "LIVES", shield_bar_w, shield_bar_y + shield_bar_h + 2, 0.75);
	this._font_r.renderTextScaled(_context, "SCORE:" + this._player._score, 0, shield_bar_y + (shield_bar_h * 2) + 10, 0.5);
	this._font_r.renderTextScaled(_context, "ENEMIES:" + this._player._num_enemies, 0, shield_bar_y + (shield_bar_h * 3), 0.5);

/*
	if (_debug_mobile)
	{	//now we render debug info.
		_context.fillStyle = "#ff0000";
		_context.font = "20px Georgia";
		_context.fillText("Ship direction[" + this._player._current_dir + "] target[" + this._player._target_dir + "]", 10, 20);
		_context.fillText("Browser[" + navigator.userAgent + "]", 10, 40);
	}
*/
}