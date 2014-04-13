/*	chatfetcher.js - Written by Mogamat Shaheed Abdol, Copyright Shaheed Abdol 2014	*/
//[Depends] on [messages.js]
//[Depends] on [rooms.js]

var chatFetcher = {
	current_message:'',
	current_function:'',
	currentUser:'',
	audio: new Audio("notification.ogg"),
	_sound_state: 1,
	room_handler: new roomHandler(),
	timerId: 0,
	
	buildRequest: function()
	{
		var output = currentServer + '?' + 
		'query=' + encodeURIComponent(this.current_function) + '&' +
		'user='+ encodeURIComponent(this.currentUser) + '&' +
		'userid='+ encodeURIComponent(_user_id) + '&' +
		'targetuserid=' + encodeURIComponent(_target_user_id) + '&' +
		'value=' + encodeURIComponent(this.current_message);
		return output;
	},
	requestChat: function()
	{
		var req = new XMLHttpRequest();
		req.open("GET", this.buildRequest(), true);
		req.onload = this.showChatLines_.bind(this);
		req.onerror = this.errorChat_.bind(this);
		req.send(null);
	},
	escape_regexp: function(str)
	{
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	},
	filter_message: function(msg)
	{
		var message = msg.replace(new RegExp(this.escape_regexp('<'), 'g'), '&lt;');
		message = message.replace(new RegExp(this.escape_regexp('>'), 'g'), '&gt;');
		message = message.replace(new RegExp(this.escape_regexp('['), 'g'), '&#91;');
		message = message.replace(new RegExp(this.escape_regexp(']'), 'g'), '&#93;');
		message = message.replace(new RegExp(this.escape_regexp('{'), 'g'), '&#123;');
		message = message.replace(new RegExp(this.escape_regexp('}'), 'g'), '&#125;');
		return message;
	},
	sendChat: function(cb, message)
	{
		this.current_message = this.filter_message(message);
		this.current_function = 'send';
		this.requestChat();
		cb(-1);	//TODO: This callback execution must be removed - let the user decide when to end a private chat.
	},
	joinChat: function(cb, user)
	{
		this.currentUser = user;
		this.current_function = 'join';
		this.requestChat();
		this.timerId = setInterval(cb, 2000);
	},
	endChat: function()
	{
		clearTimeout(this.timerId);
		this.current_message = 'has left the chatroom';
		this.current_function = 'remove';
		this.requestChat();
	},
	handleMessageAdd: function(obj, substr, fromid, toid)
	{
		var messObj = new chatMessage(substr, fromid, toid), tomsg = '';
		if (_user_id == -1)
			setUserId(messObj.messageNumber);

		var addMessage = 0, privateMessage = 0;
		if (fromid == -1 && toid == -1)	//joined the room message.
			addMessage = 1;
		if (fromid != -1 && toid == -1)	//general message from some user.
			addMessage = 1;	
		if (toid != -1 && toid == _user_id)	//private message from some user.
		{
			addMessage = 1;
			privateMessage = 1;
		}
		if (fromid != -1 && fromid == _user_id)	//this is a message I sent to another user privately.
		{
			if (toid != -1)	//this should not be true
			{
				tomsg = " -> " + obj.getChatmiumUser(obj, toid);
				privateMessage = 1;
			}
			addMessage = 1;
		}

		var privPrefix = (privateMessage ? '<img class="smileysmall" src="ui/iconpvt.png">&nbsp;&nbsp;' : "")
		if (addMessage != 0)
		{	//messages are handled here.
			var fromuserid = (fromid == _user_id ? -1 : fromid);
			obj.room_handler.addMessage(obj.room_handler, fromuserid, privPrefix, messObj, tomsg);
		}
		return addMessage;
	},
	showChatLines_: function (e, callback)
	{
		if (e.target.responseText.length)
		{
			var remainingContent = e.target.responseText;
			var messageType = 0;	//old message type
			var messageAdded = 0;
			var messageReturn = 0;

			while (messageType != -1)
			{
				messageType = determineMessageType(remainingContent);

				if (messageType == 0)	//old message type
					messageReturn = parseOldMessage(this, this.handleMessageAdd, remainingContent);
				else if (messageType != -1)
					messageReturn = parseNewMessage(this, this.handleMessageAdd, messageType, remainingContent);	//allows for more than one format
					
				remainingContent = messageReturn[0];
				
				if (messageReturn[1])
					messageAdded = 1;
			}

			if (messageAdded)
			{
				var container = document.getElementById("chatcontent");
				if (container)
					container.scrollTop = container.scrollHeight;

				if (this._sound_state == 1)
				{
					this.audio.volume = 0.5;
					this.audio.play();
				}
			}
		}
	},
	errorChat_: function (e){},
};