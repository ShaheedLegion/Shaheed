//Simple Observer pattern implementation

ObserverList = function(func)
{
	this._function = func;
	this.callbacks = [];
}

ObserverList.prototype.broadcast = function(vars)
{
	for (var i = 0; i < this.callbacks.length; i++)
		this.callbacks[i](vars);
}

Broadcaster = function()
{
	this.observers = [];
}

Broadcaster.prototype.registerObserver = function(funcname, callback)
{
	var observer = this.getObserver(funcname);
	if (observer == -1)
	{
		var obs = new ObserverList(funcname);
		obs.callbacks.push(callback);
		this.observers.push(obs);
		return;
	}
	observer.callbacks.push(callback);
}

Broadcaster.prototype.getObserver = function(funcname)
{
	for (var i = 0; i < this.observers.length; i++)
	{
		if (this.observers[i]._function == funcname)
			return this.observers[i];
	}
	return -1;
}

Broadcaster.prototype.broadcast = function(funcname, vars)
{
	var obs = this.getObserver(funcname);
	if (obs != -1)
		obs.broadcast(vars);
}