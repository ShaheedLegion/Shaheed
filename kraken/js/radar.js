Radar = function(_broadcaster, _world)
{
	this._broadcaster = _broadcaster;
	this._world = _world;
	this._sprite_bg = new Image();
	this._sprite_bg.onload = this.ready.bind(this);
	this._sprite_fg = new Image();
	this._canvas = document.createElement("canvas");	//use offscreen canvas to accomplish rendering.
	
	this._sprite_bg.src = "images/radarbg.png";
	this._sprite_fg.src = "images/radarfg.png";
	this._display_w = 0;
	this._display_h = 0;
}

Radar.prototype.ready = function()
{
	this._display_w = this._sprite_bg.width;
	this._display_h = this._sprite_bg.height;
	this._canvas.width = this._display_w;
	this._canvas.height = this._display_h;
	this._canvas.clientWidth = this._display_w;
	this._canvas.clientHeight = this._display_h;
}

Radar.prototype.addWorldTransform = function(w, h)
{	//the world transform allows us to handle scale changes.
}

Radar.prototype.render = function(_context)
{
	//For now we just focus on rendering the ship coordinates relative to the world.
	if (this._display_w == 0)
		return;	//the sprite is not ready to be drawn.

	var _ctx = this._canvas.getContext("2d");
	//_ctx.fillStyle = "#000000";
	//_ctx.fillRect(0, 0, this._display_w, this._display_h);
	_ctx.drawImage(this._sprite_bg, 0, 0, this._sprite_bg.width, this._sprite_bg.height);

	//this._world.renderScaledView(_ctx, this._display_w, this._display_h);
	this._world.renderScaledViewClipped(_ctx, 10, 10, 300, 232);
	
	_ctx.drawImage(this._sprite_fg, 0, 0, this._sprite_fg.width, this._sprite_fg.height);
	
	_context.drawImage(this._canvas, 0, 0, this._display_w, this._display_h);	//for now we will render the context at the top-left.
}
Radar.prototype.getRadarWidth = function()
{
	return this._display_w;
}
Radar.prototype.getRadarHeight = function()
{
	return this._display_h;
}