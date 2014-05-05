ProjectileManager = function(imgname, numprojectiles)
{
	this._x = 0;
	this._y = 0;
	this._view_w = 0;
	this._view_h = 0;
	this._pw = 16;	//make sure to set this in a callback once the image loads
	this._ph = 16;
	this._oculus = new Array();
	this._oculus.push(0);
	this._oculus.push(0);
	this._radius = 200;
	this._projectile_speed = 25;
	this._projectile_timer = 50;	//we will fire one projectile every 10 frames (3 projectiles per second)
	this._sprite = new Image();
	this._sprite.onload = this.loaded.bind(this);
	this._sprite.src = 'images/sprites/' + imgname;
	this._num_projectiles = numprojectiles;
	
	this._projectiles = new Array();
	for (var i = 0; i < numprojectiles * 6; i++)	//x, y, angle, alive
		this._projectiles.push(0);	//push dummy value into array to get the correct number of variables to describe each projectile
}
ProjectileManager.prototype.loaded = function()
{
	this._pw = this._sprite.width;
	this._ph = this._sprite.height;
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

ProjectileManager.prototype.update = function(direction)
{
	this._projectile_timer--;
	if (this._projectile_timer == 0)
	{	//time to fire a new projectile
		for (var i = 0; i < this._num_projectiles; i += 6)
		{
			if (this._projectiles[i + 3] != 1)	//we have found a dead projectile, fire it.
			{
				this._projectiles[i + 0] = this._x - (this._pw / 2);
				this._projectiles[i + 1] = this._y - (this._ph / 2);
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
}
ProjectileManager.prototype.setOculusLocation = function(x, y, w, h)
{
	this._x = x + (w / 2);
	this._y = y + (h / 2);
	this._oculus[0] = x;
	this._oculus[1] = y + this._radius;
}
ProjectileManager.prototype.updateToPoint = function(direction, x, y, w, h)
{
	this.setOculusLocation(x, y, w, h);
	this._projectile_timer--;
	if (this._projectile_timer == 0)
	{	//time to fire a new projectile
		for (var i = 0; i < this._num_projectiles; i += 6)
		{
			if (this._projectiles[i + 3] != 1)	//we have found a dead projectile, fire it.
			{
				this._projectiles[i + 0] = this._x - (this._pw / 2);
				this._projectiles[i + 1] = this._y - (this._ph / 2);
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
}
ProjectileManager.prototype.render = function(_context)
{
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
				_context.drawImage(this._sprite, this._projectiles[i + 0], this._projectiles[i + 1], this._pw, this._ph);
			else
				this._projectiles[i + 3] = 0;

			this._projectiles[i + 0] += this._projectiles[i + 4];;
			this._projectiles[i + 1] += this._projectiles[i + 5];
		}
	}
}
ProjectileManager.prototype.renderWithinViewPort = function(_context)
{
	var hr = new HitRect(0, 0, 0, 0);
	for (var i = 0; i < this._num_projectiles; i += 6)
	{
		if (this._projectiles[i + 3] != 0)	//only update if it's alive
		{	//now move the projectile along its path.
			var draw = 1;
			hr.set(this._x - (this._view_w / 2), this._y - (this._view_h / 2), this._view_w, this._view_h);
			if (!hr.HitTest(this._projectiles[i + 0], this._projectiles[i + 1]))
				draw = 0;
			//if ((this._projectiles[i + 0] < 0) || (this._projectiles[i + 0] > this._view_w))
			//	draw = 0;
			//if ((this._projectiles[i + 1] < 0) || (this._projectiles[i + 1] > this._view_h))
			//	draw = 0;

			if (draw)
				_context.drawImage(this._sprite, this._projectiles[i + 0], this._projectiles[i + 1], this._pw, this._ph);
			else
				this._projectiles[i + 3] = 0;

			this._projectiles[i + 0] += this._projectiles[i + 4];;
			this._projectiles[i + 1] += this._projectiles[i + 5];
		}
	}
}
ProjectileManager.prototype.HitTestEnemies = function(_world, enemies)
{
	var ret = [];
	var projectileRect = new HitRect(0, 0, 0, 0);
	var enemyRect = new HitRect(0, 0, 0, 0);
	var vp = [];
	for (var i = 0; i < enemies.length; i++)
	{
		if (!enemies[i]._exploding)
		{	//do not handle collisions if they are exploding already.
			var idx = enemies[i]._idx;
			if (_world.pointInViewport(idx))	//if the point is visible on the viewport
			{
				_world.getViewPointInto(idx, vp);
				enemyRect.set(vp[0], vp[1], enemies[i]._sprite.width, enemies[i]._sprite.height);
				for (var j = 0; j < this._projectiles.length; j += 6)
				{
					projectileRect.set(this._projectiles[j + 0], this._projectiles[j + 1], this._pw, this._ph);
					if (enemyRect.IntersectTest(projectileRect))
					{
						ret.push(idx);	//as well as handle collision for this projectile ... set visible to false?
						this._projectiles[j + 3] = 0;	//mark as not visible / dead
						break;	//only one projectile can hit an enemy at a time.
					}
				}
			}
		}
	}
	return ret;
}