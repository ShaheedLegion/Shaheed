//main game logic sits here
var _broadcaster;
var _screens;
var _canvas;
var _font_r;

AudioDesc = function(name, repeat, endedcb, broadcaster)
{
  this._audio = new Audio();
  this._audio.onloadeddata = this.playAudio.bind(this);
  this.audiofinished = endedcb;
  this.repeat = repeat;
  this._audio.src = name;
  broadcaster.registerObserver("muted", this.mutedAudio.bind(this));
  setInterval(this.checkAudio.bind(this), 10);
}

AudioDesc.prototype.playAudio = function()
{
  this._audio.play();
}

AudioDesc.prototype.mutedAudio = function(vars) {
  if (vars[0] == true)
    this._audio.pause();
  else
    this._audio.play();
}

AudioDesc.prototype.checkAudio = function()
{
  if (this._audio.ended)
  {
    this.audiofinished(this.name);
    if (this.repeat)
      this.playAudio();
  }
}

window.onload = initialize();

function initialize()
{
  _broadcaster = new Broadcaster();
  _world = new GameWorld(_broadcaster);
  _font_r = new FontRenderer();
  _screens = new ScreenHandler(_broadcaster, _world, _font_r);
  _canvas = new CanvasHandler('myCanvas', _broadcaster);
  
  _audio = new Array();
  _audio.push(new AudioDesc("sounds/lost.ogg", 1, trackEnded, _broadcaster));
}

function trackEnded(name)
{
  //do nothing for now, in future we will play the next track in the list.
}
