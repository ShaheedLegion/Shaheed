CanvasHandler = function(id, broadcaster)
{
	this._canvas = document.getElementById(id);
	this._context = this._canvas.getContext("2d");
	this._canvas.addEventListener('mousedown', this.handleClick.bind(this), false);
	window.onresize = this.handleResize.bind(this);
	
	this.click_x = 0;
	this.click_y = 0;
	
	this.broadcaster = broadcaster;
	this.broadcaster.broadcast('canvas', [this, 0]);
	this.broadcaster.broadcast('resize', [this._canvas.clientWidth, this._canvas.clientHeight]);
	this.handleResize();
}

CanvasHandler.prototype.handleClick = function(_event)
{
    var x;
    var y;
    if (_event.pageX || _event.pageY)
	{
      x = _event.pageX;
      y = _event.pageY;
    }
    else
	{
      x = _event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      y = _event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
	
	this.click_x = x;
	this.click_y = y;
	this.broadcaster.broadcast('click', [x, y]);
}

CanvasHandler.prototype.handleResize = function()
{
	var h = document.body.clientHeight;
	var w = document.body.clientWidth;
	this._canvas.style.width = w;
	this._canvas.style.height = h;
	this._canvas.width = w;
	this._canvas.height = h;
	this.broadcaster.broadcast('resize', [w, h]);
}