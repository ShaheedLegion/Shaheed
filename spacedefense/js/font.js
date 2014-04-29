FontRenderer = function()
{
	this._font_sprite = new Image();
	this._font_sprite.onload = this.loadedFont.bind(this);
	this._font_sprite.src = "images/font.png";
	this.loaded = false;
	this._storage_length = 256;	//arbitrary string length limitation, probably won't need more storage.
	this._storage = new Array(this._storage_length);
	this._letter_width = 45;	//22 pixels per letter
	this._letter_height = 44;	//24 pixels per letter
	
	this._representation = 
	[
	'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
	'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 
	'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', ';', '%', ':', '?', '*', '(', ')', '_', '+', '-', '=', '.', ',', '/', '|',
	'"', '\'', '@', '#', '$', '^', '&', '{', '}', '[', ']'
	];
}

FontRenderer.prototype.loadedFont = function()
{
	this.loaded = true;
}

FontRenderer.prototype.findStringIndex = function(_char)
{
	//do something fancy to find the char...
	for (var i = 0; i < this._representation.length; i++)
	{
		if (this._representation[i] == _char)
			return i;
	}
	return -1;
}

FontRenderer.prototype.findIndices = function(text)
{
	var length = (text.length > this._storage_length ? this._storage_length : text.length);
	var idx = -1;
	for (var i = 0; i < length; i++)
	{
		idx = this.findStringIndex(text[i]);
		this._storage[i] = idx;
	}
	return length;
}

FontRenderer.prototype.renderLetter = function(_context, idx, x, y, scale)
{	//render letter in given position at the given scale.
	if (idx == -1)
		return;

	var sp_x = (idx * this._letter_width);
	var sp_y = 0;//((idx / 31) > 1) ? ((idx / 31) * 54) : 0;
	_context.drawImage(this._font_sprite, sp_x, sp_y, this._letter_width, this._letter_height, x, y, this._letter_width * scale, this._letter_height * scale);
}

FontRenderer.prototype.renderText = function(_context, text, x, y)
{
	this.renderTextScaled(_context, text, x, y, 1);
}

FontRenderer.prototype.renderTextScaled = function(_context, text, x, y, scale)
{
	if (!this.loaded)
		return;

	var length = this.findIndices(text);
	var current_x = x;
	for (var i = 0; i < length; i++)
	{
		this.renderLetter(_context, this._storage[i], current_x, y, scale);
		current_x += (this._letter_width * scale);
	}
}