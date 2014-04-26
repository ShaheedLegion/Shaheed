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
	
	this._world_dimensions = new Vector(9600, 5400);	//width and height of the actual world
	this._current_dir = 0;
	
	this._world_points = new Array();	//x and y pairs
	this._viewport = new ViewPort(0, 0, 0, 0);
	this._viewport_speed = 6;	//that is (x)px per frame.
	this._num_fields = 8;	//x, y, dx, dy, visible, w, h
	this.player_rect = new HitRect(0, 0, 0, 0);
	this._player_w = 0;
	this._player_h = 0;
}

GameWorld.prototype.setPlayerDims = function(w, h)
{
	this._player_w = w;
	this._player_h = h;
}

GameWorld.prototype.handleDirChange = function(_vars)
{
	this._current_dir = _vars[0];
}

GameWorld.prototype.addWorldPoint = function(x, y, dx, dy)
{
	this._world_points.push(x);//x
	var idx = this._world_points.length - 1;	//return the index at the point where x was added.
	this._world_points.push(y);//y
	this._world_points.push(dx);
	this._world_points.push(dy);
	this._world_points.push(0);	//point in viewport, updated every frame.
	this._world_points.push(1);	//point width
	this._world_points.push(1);	//point height
	this._world_points.push(idx);	//now we have the "id" of the point
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
GameWorld.prototype.getViewPointInto = function(idx, vp)
{
	vp[0] = this._world_points[idx + 0] - this._viewport._port_location._x;
	vp[1] = this._world_points[idx + 1] - this._viewport._port_location._y;
}
GameWorld.prototype.setPointDims = function(idx, w, h)
{
	this._world_points[idx + 5] = w;
	this._world_points[idx + 6] = h;
}


GameWorld.prototype.getDimensions = function()
{
	return this._world_dimensions;
}

GameWorld.prototype.handleResize = function(dims)
{	//do nothing for now, we simply ignore the fact that the screen size changes
	this._viewport._port_dimensions._x = dims[0];
	this._viewport._port_dimensions._y = dims[1];
}

GameWorld.prototype.update = function()
{//update the viewport - this is always moving.
	if (this._current_dir == 2)	//up
		this._viewport._port_location._y -= this._viewport_speed;
	if (this._current_dir == 0)	//down
		this._viewport._port_location._y += this._viewport_speed;
	if (this._current_dir == 1)	//left
		this._viewport._port_location._x -= this._viewport_speed;
	if (this._current_dir == 3)	//right
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
	for (var i = 0; i < this._world_points.length; i += this._num_fields)
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

		viewrect.expand(this._world_points[i + 5], this._world_points[i + 6]);	//expand the rect to take the size into account
		this._world_points[i + 4] = viewrect.HitTest(this._world_points[i + 0], this._world_points[i + 1]);
		viewrect.contract(this._world_points[i + 5], this._world_points[i + 6]);	//reset the rect.
	}
}

GameWorld.prototype.HitTestPlayer = function()
{
	var _ret = [];
	this.player_rect.set((this._viewport._port_dimensions._x / 2) - (this._player_w / 2),
		(this._viewport._port_dimensions._y / 2) - (this._player_h / 2), this._player_w, this._player_h);

	this.player_rect.contract(10, 10);	//shrink the hit box by 10 pixels to make the test slightly more accurate.
	this.player_rect.floor();

	var testRect = new HitRect(0, 0, 0, 0);
	for (var i = 0; i < this._world_points.length; i += this._num_fields)
	{
		if (this._world_points[i + 4])	//visible
		{	//detect broad scale collisions between these objects and the player
			var vp = this.getViewPoint(i);
			testRect.set(vp[0],  vp[1],	this._world_points[i + 5], this._world_points[i + 6]);
			testRect.floor();
			
			if (testRect.IntersectTest(this.player_rect))
				_ret.push(this._world_points[i + 7]);	//add the intersected sprite to the list we return
		}
		
	}
	return _ret;
}

GameWorld.prototype.renderScaledView = function(_context, w, h)
{
	var _scale_x = (w / this._world_dimensions._x);
	var _scale_y = (h / this._world_dimensions._y);


	_context.fillStyle = "rgb(255, 0, 0)";
	var t_x = 0, t_y = 0;	//render the enemies
	for (var i = 0; i < this._world_points.length; i += this._num_fields)
	{
		t_x = Math.floor(this._world_points[i + 0] * _scale_x);
		t_y = Math.floor(this._world_points[i + 1] * _scale_y);
		_context.fillRect(t_x, t_y, 1, 1);
	}
	
	var vx = this._viewport._port_location._x * _scale_x;
	var vy = this._viewport._port_location._y * _scale_y;
	var vw = this._viewport._port_dimensions._x * _scale_x;
	var vh = this._viewport._port_dimensions._y * _scale_y;
	var px = vx + (vw / 2);
	var py = vy + (vh / 2);

	_context.beginPath();
	_context.strokeStyle = "rgb(0, 0, 255)";
	drawRect(_context, vx, vy, vw, vh);	//render the viewport bounds
	
	_context.fillStyle = "rgb(0, 255, 0)";
	_context.fillRect(px, py, 1, 1);
	
	_context.beginPath();
	_context.strokeStyle = "rgb(192, 192, 192)";
	drawRect(_context, 1, 1, w-2, h-2);	//render the scaled view bounds
}