Player = function(enemies)
{	//the player .. which will hold the sprites which control the player.
	this._x = 0;
	this._y = 0;
	this._w = 112;
	this._h = 112;
	this._view_w = 0;
	this._view_h = 0;
	this._target_dir = 0;
	this._current_dir = 0;
	this._score = 0;
	this._score_increment = 10;
	this._num_enemies = enemies;
	this._level = 0;

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

Player.prototype.render = function(_context, _font)
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
		_font.renderTextScaledCentered(_context, "SHIELD", shield_bar_w, shield_bar_y + 10, 0.5);

		_context.strokeStyle = "#0000FF";
		_context.fillStyle = "#0000FF";
		fillRect(_context, 0, shield_bar_y + shield_bar_h, current_lives_w, shield_bar_h);
		drawRect(_context, 0, shield_bar_y + shield_bar_h, shield_bar_w, shield_bar_h);
		_font.renderTextScaledCentered(_context, "LIVES", shield_bar_w, shield_bar_y + shield_bar_h + 10, 0.5);
	}
	
	_font.renderTextScaled(_context, "SCORE:" + this._score, 0, shield_bar_y + (shield_bar_h * 2) + 10, 0.5);
	_font.renderTextScaled(_context, "ENEMIES:" + this._num_enemies, 0, shield_bar_y + (shield_bar_h * 3), 0.5);
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

Player.prototype.updateScore = function()
{	//increment the player score...
	this._score += this._score_increment;
}

Player.prototype.setEnemies = function(enemies)
{
	this._num_enemies = enemies;
}
Player.prototype.setLevel = function(level)
{
	this._level = level;
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