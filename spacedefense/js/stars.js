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
	var len = this._stars.length;
	for (var i = 0; i < len; i += 2)
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
	
	var vw = w;
	var vh = h;

	var len = this._stars.length;
	for (var i = 0; i < len; i += 2)	//we will need to reinitialize the star field here.
	{
		this._stars[i + 0] = (Math.random() * vw);
		this._stars[i + 1] = (Math.random() * vh);
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
	
	var len = this._stars.length;
	var vw = this._view_w;
	var vh = this._view_h;

	for (var i = 0; i < len; i += 2)
	{
		this._stars[i + 0] += dx;
		this._stars[i + 1] += dy;
		
		if (this._stars[i + 0] < 0)
			this._stars[i + 0] = vw;
		if (this._stars[i + 0] > vw)
			this._stars[i + 0] = 0;
		if (this._stars[i + 1] < 0)
			this._stars[i + 1] = vh;
		if (this._stars[i + 1] > vh)
			this._stars[i + 1] = 0;
	}
}