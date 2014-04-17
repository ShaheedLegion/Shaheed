//main game logic sits here
var _broadcaster;
var _screens;

window.onload = initialize();

function initialize()
{
	_broadcaster = new Broadcaster();
	_screens = new ScreenHandler(_broadcaster);
	_canvas = new CanvasHandler('myCanvas', _broadcaster);
}