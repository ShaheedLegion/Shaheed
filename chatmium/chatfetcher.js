/*
chatfetcher.js - Written by Mogamat Shaheed Abdol
Copyright Shaheed Abdol 2014
*/

//[Depends] on [messages.js]

var chatFetcher = {
	current_message:'',
	current_function:'',
	currentUser:'',
	notification: null,
	audio: new Audio("alert.ogg"),
	_sound_state: 1,
	chatMessages: new Array(),
	uniqueUsers: {},
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
	}
	,
	requestChat: function()
	{
		var req = new XMLHttpRequest();
		req.open("GET", this.buildRequest(), true);
		req.onload = this.showChatLines_.bind(this);
		req.onerror = this.errorChat_.bind(this);
		req.send(null);
	}
	,
	escape_regexp: function(str)
	{
		return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
	}
	,
	filter_message: function(msg)
	{
	
		var message = msg.replace(new RegExp(this.escape_regexp('<'), 'g'), '&lt;');
		message = message.replace(new RegExp(this.escape_regexp('>'), 'g'), '&gt;');
		message = message.replace(new RegExp(this.escape_regexp('['), 'g'), '&#91;');
		message = message.replace(new RegExp(this.escape_regexp(']'), 'g'), '&#93;');
		message = message.replace(new RegExp(this.escape_regexp('{'), 'g'), '&#123;');
		message = message.replace(new RegExp(this.escape_regexp('}'), 'g'), '&#125;');
		return message;
	}
	,
	sendChat: function(cb, message)
	{
		this.current_message = this.filter_message(message);
		this.current_function = 'send';
		this.requestChat();
		
		cb(-1);	//send and discard.
	}
	,
	joinChat: function(cb, user)
	{
		this.currentUser = user;
		this.current_function = 'join';
		this.requestChat();

		this.timerId = setInterval(cb, 2500);
	}
	,
	findLastMessage: function(obj)
	{
		var highest = 0;
		for (var i = 0; i < obj.chatMessages.length; i++)
		{
			if (obj.chatMessages[i].messageNumber > highest)
				highest = obj.chatMessages[i].messageNumber;
		}
		return highest;
	}
	,
	endChat: function()
	{
		clearTimeout(this.timerId);
		this.current_message = 'has left the chatroom';
		this.current_function = 'remove';
		this.requestChat();
	}
	,
	sendChatmiumMessage: function(cb, message)
	{
		this.sendChat(cb, message);
	}
	,
	handleMessageAdd: function(obj, substr, fromid, toid)
	{
		var messObj = new chatMessage(substr, fromid, toid);
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
		
		var tomsg = '';
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
		{
			var parent = document.getElementById('chatitems');	
			var li = document.createElement('li');
			li.innerHTML = privPrefix + "<b>" + messObj.getOwnerLink(obj, obj.addChatmiumUser) + tomsg +  ":  </b>" + messObj.messageText;
			obj.setBubbleColor(li);
			parent.appendChild(li);
			
			obj.chatMessages.push(messObj);
		}
	}
	,
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
				/*
					//Here we set up the notification system which will be used by the app.
				var opt =
				{
					type: "basic",
					title: "Message Received",
					message: "A new message has been received!",
					iconUrl: "iconsm.png"
				}
				*/
				if (this._sound_state == 1)
				{
					this.audio.volume = 0.5;
					this.audio.play();
				}
			}
		}
	}
	,
	errorChat_: function (e)
	{
		//Do nothing in this case - popping up an error would affect the UX.
	}
	,
	addChatmiumUser: function(obj, fromId, messageOwner)
	{
		if (fromId == -1)
			return;

		var userFound = 0;
		for (var name in obj.uniqueUsers)
		{
			if (name == messageOwner)
			{
				userFound = 1;
				break;
			}
		}
		
		if (userFound == 0)
			obj.uniqueUsers[messageOwner] = fromId;
	}
	,
	getChatmiumUser: function(obj, userId)
	{
		for (var name in obj.uniqueUsers)
		{
			if (obj.uniqueUsers[name] == userId)
			{
				return name;
			}
		}
		return "";
	}
	,
	setBubbleColor: function(element)
	{	//can use more complex formula to determine the bg color.
		var colr = Math.floor(128 + (Math.random() * 55));
		var colg = Math.floor(128 + (Math.random() * 55));
		var colb = Math.floor(128 + (Math.random() * 55));
	
		if (element)
		{
			var colString = "rgb(" + colr + "," + colg + "," + colb + ")";
			element.style.background = colString;
			
			//repeat for compatible browsers
			colr = Math.floor(200 + (Math.random() * 55));
			colg = Math.floor(200 + (Math.random() * 55));
			colb = Math.floor(200 + (Math.random() * 55));
			
			var endColString = "rgb(" + colr + "," + colg + "," + colb + ")"
			element.style.backgroundImage = gradientPrefix + 'linear-gradient('
			+ 'bottom' + ', ' + endColString + ' 25%, ' + colString + ' 100%)';
		}
	}
	,
	/*
	gotNewMember: function (e)
	{
	
		var line = e.data;
		var messObj = new chatMessage(line);
		
		var parent = document.getElementById('chatitems');
		var li = document.createElement('li');
		li.innerHTML = "<span class='green'><b>" + messObj.messageOwner + ":  </b>" + messObj.messageText + '</span>';
		parent.appendChild(li);

		this.chatMessages.push(messObj);
	}
	,
	
	gotLessMember: function(e)
	{
		var line = e.data;
		var messObj = new chatMessage(line);
		
		var parent = document.getElementById('chatitems');
		var li = document.createElement('li');
		//li.innerHTML = "<b>" + messObj.messageOwner + ":  </b>" + messObj.messageText;
		li.innerHTML = "<span class='red'><b>" + messObj.messageOwner + ":  </b>" + messObj.messageText + '</span>';
		parent.appendChild(li);

		this.chatMessages.push(messObj);
	},
	gotPvtMessage: function(e)
	{
		var line = e.data;
		var messObj = new chatMessage(line);
		
		var parent = document.getElementById('chatitems');
		var li = document.createElement('li');
		//li.innerHTML = "<b>" + messObj.messageOwner + ":  </b>" + messObj.messageText;
		li.innerHTML = "<span class='grey'><b>" + messObj.messageOwner + ":  </b>" + messObj.messageText + '</span>';
		parent.appendChild(li);

		this.chatMessages.push(messObj);
	},
	*/
};