WorldPoint = function(x, y, dx, dy, idx)
{
	this.x = x;//x
	this.y = y;//y
	this.dx = dx;
	this.dy = dy;
	this.in_vp = 0;	//point in viewport, updated every frame.
	this.w = 1;	//point width
	this.h = 1;	//point height
	this.idx = idx;	//now we have the "id" of the point
	this.alive = 1;	//alive - default is true for all points
}

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
	this._world_points = new Array();	//x and y pairs
	this._viewport = new ViewPort(0, 0, 0, 0);
	this.player_rect = new HitRect(0, 0, 0, 0);
}

GameWorld.prototype._current_dir = 0;
GameWorld.prototype._viewport_speed = 6;	//that is (x)px per frame.
GameWorld.prototype._num_fields = 9;	//x, y, dx, dy, visible, w, h, id, alive
GameWorld.prototype._player_w = 0;
GameWorld.prototype._player_h = 0;

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
	var pt = new WorldPoint(x, y, dx, dy, -1);
	this._world_points.push(pt);	//alive - default is true for all points
	var idx = this._world_points.length - 1;	//return the index at the point where x was added.
	this._world_points[idx].idx = idx;

	return idx;
}
/*
GameWorld.prototype.getWorldPoint = function(idx)
{	//return the point only - not the deltas
	return this._world_points[idx];
}
*/
GameWorld.prototype.pointInViewport = function(idx)
{	//the point in viewport calculation is updated each frame.
	return this._world_points[idx].in_vp;
}
GameWorld.prototype.setAlive = function(idx, alive)
{
	this._world_points[idx].alive = alive;
}
GameWorld.prototype.getViewPoint = function(idx)
{	//get point translated to viewpoint origin.
	var point = this._world_points[idx];
	return [point.x - this._viewport._port_location._x, point.y - this._viewport._port_location._y];
}
GameWorld.prototype.getViewPointInto = function(idx, vp)
{
	var point = this._world_points[idx];
	vp[0] = point.x - this._viewport._port_location._x;
	vp[1] = point.y - this._viewport._port_location._y;
}
GameWorld.prototype.returnPoint = function(idx)
{
	return this._world_points[idx];
}
GameWorld.prototype.calculateViewPointInto = function(point, vp)
{
	vp[0] = point.x - this._viewport._port_location._x;
	vp[1] = point.y - this._viewport._port_location._y;
}
GameWorld.prototype.setPointDims = function(idx, w, h)
{
	var point = this._world_points[idx];
	point.w = w;	//this might not be the fastest way...
	point.h = h;
	this._world_points[idx] = point;
}
GameWorld.prototype.getDimensions = function()
{
	return this._world_dimensions;
}
GameWorld.prototype.getViewPort = function()
{
	return this._viewport;
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
	var len = this._world_points.length;
	
	var point;
	for (var i = 0; i < len; i ++)
	{	//update all the points in the world with their deltas. Do rudimentary bounds checking.
		point = this._world_points[i];
		point.x += point.dx;
		point.y += point.dy;
		
		if (point.x > this._world_dimensions._x)
			point.x %= this._world_dimensions._x;
		if (point.x < 0)
			point.x = this._world_dimensions._x - point.x;
		if (point.y > this._world_dimensions._y)
			point.y %= this._world_dimensions._y;
		if (point.y < 0)
			point.y = this._world_dimensions._y - point.y;

		viewrect.expand(point.w, point.h);	//expand the rect to take the size into account
		point.in_vp = viewrect.HitTest(point.x, point.y);
		viewrect.contract(point.w, point.h);	//reset the rect.
		
		this._world_points[i] = point;	//there has to be a better way to do this.
	}
}

GameWorld.prototype.HitTestPlayer = function()
{
	var _ret = [];
	this.player_rect.set((this._viewport._port_dimensions._x / 2) - (this._player_w / 2),
		(this._viewport._port_dimensions._y / 2) - (this._player_h / 2), this._player_w, this._player_h);

	//this.player_rect.contract(10, 10);	//shrink the hit box by 10 pixels to make the test slightly more accurate.
	this.player_rect.floor();

	var testRect = new HitRect(0, 0, 0, 0);
	var len = this._world_points.length;
	
	var point;
	var vp = [];

	for (var i = 0; i < len; i ++)
	{
		point = this._world_points[i];
		if (point.in_vp)	//visible
		{	//detect broad scale collisions between these objects and the player
			this.calculateViewPointInto(point, vp);
			testRect.set(vp[0],  vp[1],	point.w, point.h);
			testRect.floor();
			
			if (testRect.IntersectTest(this.player_rect))
				_ret.push(point.idx);	//add the intersected sprite to the list we return
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
	var len = this._world_points.length;
	
	var point;
	for (var i = 0; i < len; i++)
	{
		point = this._world_points[i];
		if (point.alive)
		{
			t_x = Math.floor(point.x * _scale_x);
			t_y = Math.floor(point.y * _scale_y);
			_context.fillRect(t_x, t_y, 1, 1);
		}
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

GameWorld.prototype.renderScaledViewClipped = function(_context, x, y, w, h)
{
	_context.save();
	_context.beginPath();
    _context.rect(x, y, w, h);
    _context.clip();

	var _scale_x = (w / this._world_dimensions._x);
	var _scale_y = (h / this._world_dimensions._y);


	_context.fillStyle = "rgb(255, 0, 0)";
	var t_x = 0, t_y = 0;	//render the enemies
	
	var len = this._world_points.length;
	var point;
	for (var i = 0; i < len; i++)
	{
		point = this._world_points[i];
		if (point.alive)
		{
			t_x = Math.floor(point.x * _scale_x) + x;
			t_y = Math.floor(point.y * _scale_y) + y;
			_context.fillRect(t_x, t_y, 1, 1);
		}
	}
	
	var vx = (this._viewport._port_location._x * _scale_x) + x;
	var vy = (this._viewport._port_location._y * _scale_y) + y;
	var vw = (this._viewport._port_dimensions._x * _scale_x) + x;
	var vh = (this._viewport._port_dimensions._y * _scale_y) + y;
	var px = vx + (vw / 2);
	var py = vy + (vh / 2);

	_context.beginPath();
	_context.strokeStyle = "rgb(0, 0, 255)";
	drawRect(_context, vx, vy, vw, vh);	//render the viewport bounds
	
	_context.fillStyle = "rgb(0, 255, 0)";
	_context.fillRect(px, py, 1, 1);
	
	_context.restore();
}