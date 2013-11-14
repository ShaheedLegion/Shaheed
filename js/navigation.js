
function hideMenu()
{
	var _element = document.getElementById('menubar');
	var _toggle = document.getElementById('toggle');
	if (_element && _toggle)
	{
		var _height = _element.clientHeight;
		
		var _offset = _toggle.clientHeight;
		
		$(_element).animate({'top': -(_height - _offset) + 'px'}, 1000);
	}
}

function showMenu()
{
	var _element = document.getElementById('menubar');
	if (_element)
	{
		var _height = 0;
		
		$(_element).animate({'top': _height + 'px'}, 1000);
	}
}
