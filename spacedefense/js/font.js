FontRenderer = function()
{
	this._font_sprite = new Image();
	this._font_sprite.onload = this.loadedFont.bind(this);
	this._font_sprite.src = "images/font.png";
	this._storage = new Array(this._storage_length);

	this._representation = 
	[
	'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
	'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 
	'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', ';', '%', ':', '?', '*', '(', ')', '_', '+', '-', '=', '.', ',', '/', '|',
	'"', '\'', '@', '#', '$', '^', '&', '{', '}', '[', ']'
	];
	this._offset_letters = [63, 65, 70, 74, 75, 4, 24, 6, 16];
}

FontRenderer.prototype.loaded = false;
FontRenderer.prototype._storage_length = 256;	//arbitrary string length limitation, probably won't need more storage.
FontRenderer.prototype._letter_width = 45;	//45 pixels per letter
FontRenderer.prototype._letter_height = 44;	//44 pixels per letter
FontRenderer.prototype._letter_w_padding = 14;	//padding between letters
FontRenderer.prototype._w = 0;
FontRenderer.prototype._h = 0;

FontRenderer.prototype.loadedFont = function()
{
	this.loaded = true;
}

FontRenderer.prototype.findStringIndex = function(_char)
{
	//do something fancy to find the char...
	var len = this._representation.length;
	for (var i = 0; i < len; i++)
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

FontRenderer.prototype.getLetterYOffset = function(idx)
{
	if (idx == 2 || idx == 14)
		return 2;
	if (idx == 0 || idx == 4 || idx == 12 || idx == 18 || idx == 65)
		return 3;
	
	var len = this._offset_letters.length;
	for (var i = 0; i < len; i++)
		if (this._offset_letters[i] == idx)
			return 10;
	return 0;
}

FontRenderer.prototype.renderLetter = function(_context, idx, x, y, scale)
{	//render letter in given position at the given scale.
	if (idx == -1)
		return;

	var sp_x = (idx * this._letter_width);
	var sp_y = 0;//((idx / 31) > 1) ? ((idx / 31) * 54) : 0;
	var offset = this.getLetterYOffset(idx);
	_context.drawImage(this._font_sprite, sp_x, sp_y, this._letter_width, this._letter_height, x, y + (offset * scale), this._letter_width * scale, this._letter_height * scale);
}

FontRenderer.prototype.renderText = function(_context, text, x, y)
{
	this.renderTextScaled(_context, text, x, y, 1);
}

FontRenderer.prototype.setBounds = function(w, h)
{
	this._w = w;
	this._h = h;
}

FontRenderer.prototype.renderTextScaled = function(_context, text, x, y, scale)
{
	if (!this.loaded)
		return;

	var length = this.findIndices(text);
	var current_x = (x == -1 ? (this._w / 2) - ((length * (this._letter_width - this._letter_w_padding) * scale) / 2) : x);
	for (var i = 0; i < length; i++)
	{
		this.renderLetter(_context, this._storage[i], current_x, y, scale);
		current_x += ((this._letter_width * scale) - (this._letter_w_padding * scale));
	}
}
FontRenderer.prototype.renderTextScaledCentered = function(_context, text, w, y, scale)
{
	if (!this.loaded)
		return;

	var length = this.findIndices(text);
	var current_x = (w / 2) - ((length * (this._letter_width - this._letter_w_padding) * scale) / 2);
	for (var i = 0; i < length; i++)
	{
		this.renderLetter(_context, this._storage[i], current_x, y, scale);
		current_x += ((this._letter_width * scale) - (this._letter_w_padding * scale));
	}
}