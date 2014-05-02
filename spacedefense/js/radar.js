Radar = function(_broadcaster, _world)
{
	this._broadcaster = _broadcaster;
	this._world = _world;
	this._canvas = document.createElement("canvas");	//use offscreen canvas to accomplish rendering.
}

Radar.prototype.addWorldTransform = function(w, h)
{
	this._display_w = w / 4;//(w < 640 ? (w / 2) : (w / 4));
	this._display_h = h / 4;//(h < 480 ? (h / 2) : (h / 4));

	this._canvas.width = this._display_w;
	this._canvas.height = this._display_h;
	this._canvas.clientWidth = this._display_w;
	this._canvas.clientHeight = this._display_h;
}

Radar.prototype.render = function(_context)
{
	//For now we just focus on rendering the ship coordinates relative to the world.
	var _ctx = this._canvas.getContext("2d");
	_ctx.fillStyle = "#000000";
	_ctx.fillRect(0, 0, this._display_w, this._display_h);

	this._world.renderScaledView(_ctx, this._display_w, this._display_h);
	_context.drawImage(this._canvas, 0, 0, this._display_w, this._display_h);	//for now we will render the context at the top-left.
}