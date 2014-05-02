Explosion = function()
{
	//load up the sprite and the animation here ... set some defaults then get ready to render!!!!
	this._visible = 0;
	this._px = 0;
	this._py = 0;
	
	this._sprite = new Image();
	this._sprite.src = "images/explosion.png";
	this._sprite.onload = this.loaded.bind(this);
	this._current_frame = 0;
	this._numframes = 0;
	this._frame_delay_timer = 10;
	this._frame_delay = this._frame_delay_timer;
}
Explosion.prototype.loaded = function()
{
	this._numframes = (this._sprite.width / this._sprite.height);
}
Explosion.prototype.visible = function() {return this._visible;}
Explosion.prototype.setvisible = function(vec)
{
	this._visible = 1;
	this._px = vec[0];
	this._py = vec[1];

}
Explosion.prototype.render = function(_context)
{
	if (this.visible() && IsImageOk(this._sprite))
	{
		//_context.drawImage(this._sprite, 0, 0);
		var _current_x = (this._current_frame * this._sprite.height);
		_context.drawImage(this._sprite, _current_x, 0, this._sprite.height, this._sprite.height, this._px, this._py, this._sprite.height, this._sprite.height);
		
		this._frame_delay--;
		if (this._frame_delay <= 0)
		{
			this._current_frame++;
			this._frame_delay = this._frame_delay_timer;
		}
		if (this._current_frame >= this._numframes)
			this._visible = false;
	}
}