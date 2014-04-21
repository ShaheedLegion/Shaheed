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

ProjectileManager = function(imgname, numprojectiles)
{
	this._x = 0;
	this._y = 0;
	this._view_w = 0;
	this._view_h = 0;
	this._oculus = new Array();
	this._oculus.push(0);
	this._oculus.push(0);
	this._radius = 200;
	this._projectile_speed = 25;
	this._projectile_timer = 50;	//we will fire one projectile every 10 frames (3 projectiles per second)
	this._sprite = new Image();
	this._sprite.src = 'images/sprites/' + imgname;
	this._num_projectiles = numprojectiles;
	
	this._projectiles = new Array();
	for (var i = 0; i < numprojectiles * 6; i++)	//x, y, angle, alive
		this._projectiles.push(0);	//push dummy value into array to get the correct number of variables to describe each projectile
}

ProjectileManager.prototype.setOculus = function(x, y, w, h)
{
	this._x = x;
	this._y = y;
	this._oculus[0] = x;
	this._oculus[1] = y + this._radius;
	this._view_w = w;
	this._view_h = h;
}

ProjectileManager.prototype.update = function(_context, direction)
{
	this._projectile_timer--;
	if (this._projectile_timer == 0)
	{	//time to fire a new projectile
		for (var i = 0; i < this._num_projectiles; i += 6)
		{
			if (this._projectiles[i + 3] != 1)	//we have found a dead projectile, fire it.
			{
				this._projectiles[i + 0] = this._x - 8;
				this._projectiles[i + 1] = this._y - 8;
				this._projectiles[i + 2] = direction;
				this._projectiles[i + 3] = 1;

				var radians = direction * TO_RADIANS;
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

	for (var i = 0; i < this._num_projectiles; i += 6)
	{
		if (this._projectiles[i + 3] != 0)	//only update if it's alive
		{	//now move the projectile along its path.
			var draw = 1;
			if ((this._projectiles[i + 0] < 0) || (this._projectiles[i + 0] > this._view_w))
				draw = 0;
			if ((this._projectiles[i + 1] < 0) || (this._projectiles[i + 1] > this._view_h))
				draw = 0;

			if (draw)
				_context.drawImage(this._sprite, this._projectiles[i + 0], this._projectiles[i + 1], 16, 16);
			else
				this._projectiles[i + 3] = 0;

			this._projectiles[i + 0] += this._projectiles[i + 4];;
			this._projectiles[i + 1] += this._projectiles[i + 5];
		}
	}
}