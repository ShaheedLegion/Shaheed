function IsImageOk(img)
{
    // During the onload event, IE correctly identifies any images that
    // weren’t downloaded as not complete. Others should too. Gecko-based
    // browsers act like NS4 in that they report this incorrectly.
    if (!img.complete)
        return false;

    // However, they do have two very useful properties: naturalWidth and
    // naturalHeight. These give the true size of the image. If it failed
    // to load, either of these should be zero.
    if (typeof img.naturalWidth !== "undefined" && img.naturalWidth === 0)
        return false;

    return true;    // No other way of checking: assume it’s ok.
}

StartScreen = function(_handler, _broadcaster)
{
	this._handler = _handler;
	this._broadcaster = _broadcaster;
	this._sprite = new Image();
	this._sprite.src = "images/button_play.png";
	this._w = 0;
	this._h = 0;
	
	this._broadcaster.registerObserver('click', this.handleClick.bind(this));
	this._broadcaster.registerObserver('resize', this.handleResize.bind(this));
}

StartScreen.prototype.render = function(_context)
{
	if (IsImageOk(this._sprite))
	{
		var x = (this._w / 2) - (this._sprite.width / 2);
		var y = (this._h / 2) - (this._sprite.height / 2);
		this._handler._canvas_handler._context.drawImage(this._sprite, Math.floor(x), Math.floor(y), this._sprite.width, this._sprite.height);
	}
}

StartScreen.prototype.handleClick = function(vars)
{
	if (IsImageOk(this._sprite))
	{
		var x = (this._w / 2) - (this._sprite.width / 2);
		var y = (this._h / 2) - (this._sprite.height / 2);
		if (vars[0] > x && vars[1] > y)
		{
			if (vars[0] < (x + this._sprite.width) && vars[1] < (y + this._sprite.height))
				this._broadcaster.broadcast('StartScreenClick', vars);
		}
	}
}

StartScreen.prototype.handleResize = function(vars)
{
	this._w = vars[0];
	this._h = vars[1];
}