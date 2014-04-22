ViewPort = function(x, y, w, h)
{
	this._port_location = new Vector(x, y);
	this._port_dimensions = new Vector(w, h);
}

GameWorld = function(_observer)
{
	this._observer = _observer;
	this._observer.registerObserver("resize", this.handleResize.bind(this));
	this._observer.registerObserver("direction", this.handleDirChange.bind(this));
	
	this._world_dimensions = new Vector(192000, 108000);	//width and height of the actual world
	this._current_dir = 0;
	
	this._world_points = new Array();	//x and y pairs
	this._viewport = new ViewPort(0, 0, 0, 0);
	this._viewport_speed = 3;	//that is 3px per frame.
}

GameWorld.prototype.handleDirChange = function(_vars)
{
	this._current_dir = _vars[0];
}

GameWorld.prototype.addWorldPoint = function(x, y, dx, dy)
{
	this._world_points.push(x);//x
	var idx = this._world_points.length;	//return the length at the point where x was inserted.
	this._world_points.push(y);//y
	this._world_points.push(dx);
	this._world_points.push(dy);
	this._world_points.push(0);	//point in viewport, updated every frame.
	return idx;
}

GameWorld.prototype.getWorldPoint = function(idx)
{	//return the point only - not the deltas
	return [this._world_points[idx], this._world_points[idx + 1]];
}

GameWorld.prototype.pointInViewport = function(idx)
{	//the point in viewport calculation is updated each frame.
	return this._world_points[idx + 4];
}

GameWorld.prototype.getViewPoint = function(idx)
{	//get point translated to viewpoint origin.
	return [this._world_points[idx + 0] - this._viewport._port_location._x, this._world_points[idx + 1] - this._viewport._port_location._y];
}

GameWorld.prototype.getDimensions = function()
{
	return this._world_dimensions;
}

GameWorld.prototype.handleResize = function(w, h)
{	//do nothing for now, we simply ignore the fact that the screen size changes
	this._viewport._port_dimensions._x = w;
	this._viewport._port_dimensions._y = h;
}

GameWorld.prototype.update = function()
{//update the viewport - this is always moving.
	if (this._direction == 2)	//up
		this._viewport._port_location._y -= this._viewport_speed;
	if (this._direction == 0)	//down
		this._viewport._port_location._y += this._viewport_speed;
	if (this._direction == 1)	//left
		this._viewport._port_location._x -= this._viewport_speed;
	if (this._direction == 3)	//right
		this._viewport._port_location._x += this._viewport_speed;

	if (this._viewport._port_location._x > this._world_dimensions._x)
		this._viewport._port_location._x %= this._world_dimensions._x;
	if (this._viewport._port_location._x < 0)
		this._viewport._port_location._x = this._world_dimensions._x - this._viewport._port_location._x;
	if (this._viewport._port_location._y > this._world_dimensions._y)
		this._viewport._port_location._y %= this._world_dimensions._y;
	if (this._viewport._port_location._y < 0)
		this._viewport._port_location._y = this._world_dimensions._y - this._viewport._port_location._y;

	var viewrect = new HitRect(this._viewport._port_location._x, this._viewport._port_location._y,
							   this._viewport._port_dimensions._x, this._viewport._port_dimensions._y);
	for (var i = 0; i < this._world_points; i += 5)
	{	//update all the points in the world with their deltas. Do rudimentary bounds checking.
		this._world_points[i + 0] += this._world_points[i + 2];
		this._world_points[i + 1] += this._world_points[i + 3];
		
		if (this._world_points[i + 0] > this._world_dimensions._x)
			this._world_points[i + 0] %= this._world_dimensions._x;
		if (this._world_points[i + 0] < 0)
			this._world_points[i + 0] = this._world_dimensions._x - this._world_points[i + 0];
		if (this._world_points[i + 1] > this._world_dimensions._y)
			this._world_points[i + 1] %= this._world_dimensions._y;
		if (this._world_points[i + 1] < 0)
			this._world_points[i + 1] = this._world_dimensions._y - this._world_points[i + 1];

		this._world_points[i + 4] = viewrect.HitTest(this._world_points[i + 0], this._world_points[i + 1]);
	}
}

GameWorld.prototype.renderScaledView = function(_context, w, h)
{
	_context.strokeStyle = "rgb(255, 255, 255)";
	_context.lineCap = "round";
	_context.beginPath();
	var _scaled_x = (w / this._world_dimensions._x);
	var _scaled_y = (h / this._world_dimensions._y);
	var t_x = 0, t_y = 0;
	for (var i = 0; i < this._world_points.length; i += 5)
	{
		t_x = this._world_points[i + 0] * _scaled_x;
		t_y = this._world_points[i + 1] * _scaled_y;
		
		_context.moveTo(t_x, t_y);
		_context.lineTo(t_x + 1, t_y + 1);
		_context.stroke();
	}
}