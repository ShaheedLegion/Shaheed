ProjectileManager = function(imgname, numprojectiles)
{
	this._oculus = new Array();
	this._oculus.push(0);
	this._oculus.push(0);
	this._sprite = new Image();
	this._sprite.onload = this.loaded.bind(this);
	this._sprite.src = 'images/sprites/' + imgname;
	this._num_projectiles = numprojectiles;
	
	this._projectiles = new Array();
	for (var i = 0; i < numprojectiles * 6; i++)	//x, y, angle, alive
		this._projectiles.push(0);	//push dummy value into array to get the correct number of variables to describe each projectile
}

ProjectileManager.prototype._x = 0;
ProjectileManager.prototype._y = 0;
ProjectileManager.prototype._view_w = 0;
ProjectileManager.prototype._view_h = 0;
ProjectileManager.prototype._pw = 16;	//make sure to set this in a callback once the image loads
ProjectileManager.prototype._ph = 16;
ProjectileManager.prototype._radius = 200;
ProjectileManager.prototype._projectile_speed = 25;
ProjectileManager.prototype._projectile_timer = 50;	//we will fire one projectile every 10 frames (3 projectiles per second)

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
		var projectiles = this._num_projectiles;
		for (var i = 0; i < projectiles; i += 6)
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
		var projectiles = this._num_projectiles;
		for (var i = 0; i < projectiles; i += 6)
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
	var projectiles = this._num_projectiles;
	for (var i = 0; i < projectiles; i += 6)
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
	var projectiles = this._num_projectiles;
	for (var i = 0; i < projectiles; i += 6)
	{
		if (this._projectiles[i + 3] != 0)	//only update if it's alive
		{	//now move the projectile along its path.
			var draw = 1;
			hr.set(this._x - (this._view_w), this._y - (this._view_h), this._view_w * 2, this._view_h * 2);
			if (!hr.HitTest(this._projectiles[i + 0], this._projectiles[i + 1]))
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
ProjectileManager.prototype.HitTestEnemies = function(_world, enemies)
{
	var ret = [];
	var projectileRect = new HitRect(0, 0, 0, 0);
	var enemyRect = new HitRect(0, 0, 0, 0);
	var vp = [];
	var enemylen = enemies.length;
	var projectiles = this._projectiles.length;
	
	var point;
	for (var i = 0; i < enemylen; i++)
	{
		if (!enemies[i]._exploding)
		{	//do not handle collisions if they are exploding already.
			var idx = enemies[i]._idx;
			point = _world.returnPoint(idx);
			if (point.in_vp)	//if the point is visible on the viewport
			{
				_world.calculateViewPointInto(point, vp);
				enemyRect.set(vp[0], vp[1], enemies[i]._sprite.width, enemies[i]._sprite.height);
				for (var j = 0; j < projectiles; j += 6)
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
ProjectileManager.prototype.HitTestPlayer = function(_world, player)
{
	var ret = [];
	var projectileRect = new HitRect(0, 0, 0, 0);
	var playerRect = new HitRect(0, 0, 0, 0);
	var vp = [];
	if (!player._exploding)
	{	//do not handle collisions if they are exploding already.
		var vp = _world.getViewPort();
		var px = (vp._port_location._x + (vp._port_dimensions._x / 2)) - (player._sprite.width / 2);
		var py = (vp._port_location._y + (vp._port_dimensions._y / 2)) - (player._sprite.height / 2);
		playerRect.set(px, py, player._sprite.width, player._sprite.height);

		var projectile = this._projectiles.length;
		for (var j = 0; j < projectile; j += 6)
		{
			//projectileRect.set(this._projectiles[j + 0], this._projectiles[j + 1], this._pw, this._ph);
			if (this._projectiles[j + 3])
			{	//only hit test visible projectiles
				if (playerRect.HitTest(this._projectiles[j + 0], this._projectiles[j + 1]))
				{
					ret.push(j);	//as well as handle collision for this projectile ... set visible to false?
					this._projectiles[j + 3] = 0;	//mark as not visible / dead
					break;	//only one projectile can hit an enemy at a time.
				}
			}
		}
	}
	return ret;
}