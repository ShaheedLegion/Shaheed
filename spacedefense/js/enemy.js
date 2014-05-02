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
		return false;

	//instantiate explosion...
	this._explosion.setvisible(this._world.getViewPoint(this._idx));
	this._exploding = 1;
	this._world.setAlive(this._idx, 0);
	return true;
}