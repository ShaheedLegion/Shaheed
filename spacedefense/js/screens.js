ScreenHandler = function(_broadcaster, _world)
{
	this._canvas_handler = 0;
	this._current_screen = 0;
	this._broadcaster = _broadcaster;
	this._game_world = _world;
	this._broadcaster.registerObserver('canvas', this.canvasCreated.bind(this));
	this._broadcaster.registerObserver('StartScreenClick', this.StartGame.bind(this));
}

ScreenHandler.prototype.canvasCreated = function(vars)
{	// we are obviously on screen 1, which introduces the player to the game.
	this._canvas_handler = vars[0];
	this._current_screen = new StartScreen(this, this._broadcaster, this._game_world);
	setInterval(this.render.bind(this), 10);
}

ScreenHandler.prototype.render = function()
{
	if (this._current_screen != 0)
	{
		this._game_world.update();
		this._current_screen.update();
		this._current_screen.render(this._canvas_handler._context);
	}
}

ScreenHandler.prototype.StartGame = function(vars)
{
	this._current_screen = new GameScreen(this, this._broadcaster, this._game_world);
	this._broadcaster.broadcast('resize', [this._canvas_handler._canvas.width, this._canvas_handler._canvas.height]);
}