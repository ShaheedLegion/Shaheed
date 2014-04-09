/*
Chatmium.js

Written by Shaheed Abdol, Copyright 2013.

This file is part of my series of works which showcase my developer talents.
If you would like to reproduce my work, you must contact me to obtain permission.

This file and this notice to be preserved in-tact.
Visit my website at:

	http://www.ShaheedAbdol.co.za
	
for more information.
*/
var currentServer = "http://www.ShaheedAbdol.co.za/chatmium/chatter_enhanced.php";
//currentServer = "http://127.0.0.1/chatter_enhanced.php";	//simply reassign the variable.
var gradientPrefix = '';
var _user_id = -1;
var _target_user_id = -1;
var _user_alias = '';

chatMessage = function (str, fromid, toid)
{
	this.origStr = str;
	this.messageNumber = -1;
	this.fromId = fromid;
	this.toId = toid;	//this will always be my userid.
	this.messageOwner = '';
	this.messageText = '';

	this.decodeMessage();
}

chatMessage.prototype.decodeEmoticons = function(message)
{
	var str = message;
	if (str.length)
	{
		var pos = str.indexOf('-:|');
		while (pos > -1)
		{
			var pos2 = str.indexOf('|:-', pos);
			var imgname = str.substr(pos + 3, (pos2 - (pos + 3)));
			var part1 = str.substring(0, pos);
			var part2 = str.substring(pos2 + 3);
			str = part1 + '<img class="smiley" src="smileys/' + imgname + '"/>' + part2;
			pos = str.indexOf('-:|');
		}
	}
	return str;
}

chatMessage.prototype.decodeImages = function(message)
{
	var str = message;
	if (str.length)
	{
		var pos = str.indexOf('__|');
		while (pos > -1)
		{
			var pos2 = str.indexOf('|__', pos);
			var imgname = str.substr(pos + 3, (pos2 - (pos + 3)));
			var part1 = str.substring(0, pos);
			var part2 = str.substring(pos2 + 3);
			str = part1 + '<img class="general" src="' + imgname + '"/>' + part2;
			pos = str.indexOf('__|');
		}
	}
	return str;
}

chatMessage.prototype.decodeMessage = function()
{
	if (this.origStr.length)
	{
		var pos = this.origStr.indexOf("]");
		this.messageNumber = parseInt(this.origStr.substring(1, pos), 10);	//make sure the variable is in base 10

		pos = this.origStr.indexOf("{", pos);
		var pos2 = this.origStr.indexOf("}", pos);

		this.messageOwner = this.origStr.substring(pos + 1, pos2);

		var message = this.origStr.substring(pos2 + 1, this.origStr.length).trim();
		this.messageText = this.decodeEmoticons(message);
		this.messageText = this.decodeImages(this.messageText);
	}
}

chatMessage.prototype.getOwnerLink = function(fetcher)
{	//can only private message users after they have their id's
	if (this.messageText == "has joined the room!")	//cannot link to message when user joins a room
		return this.messageOwner;
	else
	{
		fetcher.addChatmiumUser(this.fromId, this.messageOwner);
		return "<a href='javascript:privatemessage(" + this.fromId.toString() + ")' title='Send Private Message'>" + this.messageOwner + "</a>";
	}
}

function determineMessageType(message)
{	//Check the type of a message, either old format, new format or invalid.
	var pos = message.indexOf("<line");
	if (pos == -1)
		return -1;	//invalid since we cannot find the marker
		
	var endpos = message.indexOf(">", pos);
	
	var diff = endpos - (pos + 5);
	
	if (diff > 1)
		return 1;
	
	return 0;
}


function parseOldMessage(fetcher, remainingContent)
{
	var pos = remainingContent.indexOf("<line>");
	var pos2 = pos;
	var messageAdded = 0;
	if (pos != -1)
	{
		pos2 = remainingContent.indexOf("</line>", pos + 6);
		if (pos2 != -1)	//incomplete message - might never get here, but "safety first"
		{
			var substr = remainingContent.substring(pos + 6, pos2);	//get everything inside the marker.
			fetcher.handleMessageAdd(substr, -1, -1);
			messageAdded = 1;
			pos2 += 7;
		}
	}
	return [remainingContent.substr(pos2), messageAdded];
}

function parseNewMessage(fetcher, messageType, remainingContent)
{	//don't check messageType yet, as we only have one "new" type of message.
	var pos = remainingContent.indexOf("<line");
	var pos3 = pos;
	var messageAdded = 0;
	if (pos != -1)
	{
		var pos2 = remainingContent.indexOf(">", pos);
		if (pos2 != -1)	//incomplete message.
		{
			var lineval = remainingContent.substr(pos, pos2 + 1);	//get the whole tag.
			var fromto = parseFromTo(lineval);
			
			pos3 = remainingContent.indexOf("</line>", pos2 + 1);
			if (pos3 != -1)	//incomplete message - might never get here, but "safety first"
			{
				var substr = remainingContent.substring(pos2 + 1, pos3);	//get everything inside the marker.
				fetcher.handleMessageAdd(substr, fromto[0], fromto[1]);
				messageAdded = 1;
				pos3 += 7;
			}
		}
	}
	return [remainingContent.substr(pos2), messageAdded];
}

function parseFromTo(content, startpos)
{
	var from_user_id = -1;
	var to_user_id = -1;
	var pos = content.indexOf("from='", startpos);
	
	if (pos != -1)
	{
		var _from_end = content.indexOf("'", pos + 6);
		if (_from_end != -1)	//incomplete message header
			from_user_id = parseInt(content.substring(pos + 6, _from_end));

		pos = content.indexOf("to='", _from_end + 1);
		if (pos != -1)
		{
			var _to_end = content.indexOf("'", pos + 4);
			if (_to_end != -1)	//incomplete message header
				to_user_id = parseInt(content.substring(pos + 4, _to_end));
		}
	}
	
	return [from_user_id, to_user_id];
}


var chatFetcher = {
	current_message:'',
	current_function:'',
	currentUser:'',
	notification: null,
	audio: new Audio("alert.ogg"),
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
	sendChat: function(message)
	{
		this.current_message = this.filter_message(message);
		this.current_function = 'send';
		this.requestChat(0);
		
		privatemessage(-1);	//send and discard.
	}
	,
	joinChat: function(user)
	{
		this.currentUser = user;
		this.current_function = 'join';
		this.requestChat(setUserId);

		this.timerId = setInterval(requestMessages, 2500);
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
		this.requestChat(0);
	}
	,
	sendChatmiumMessage: function(message)
	{
		this.sendChat(message);
	}
	,
	handleMessageAdd: function(substr, fromid, toid)
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

		var privPrefix = (privateMessage ? '<img class="smileysmall" src="iconpvt.png">&nbsp;&nbsp;' : "")
		if (addMessage != 0)
		{
			var parent = document.getElementById('chatitems');	
			var li = document.createElement('li');
			li.innerHTML = privPrefix + "<b>" + messObj.getOwnerLink(this) + ":  </b>" + messObj.messageText;
			setBubbleColor(li);
			parent.appendChild(li);
			
			this.chatMessages.push(messObj);
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
					messageReturn = parseOldMessage(this, remainingContent);
				else if (messageType != -1)
					messageReturn = parseNewMessage(this, messageType, remainingContent);	//allows for more than one format
					
				remainingContent = messageReturn[0];
				
				if (messageReturn[1])
					messageAdded = 1;
			}

			if (messageAdded)
			{
				var container = document.getElementById("chatcontent");
				if (container)
					container.scrollTop = container.scrollHeight;
					//Here we set up the notification system which will be used by the app.
				var opt =
				{
					type: "basic",
					title: "Message Received",
					message: "A new message has been received!",
					iconUrl: "iconsm.png"
				}
				playChatSound();
			}
		}
	}
	,
	errorChat_: function (e)
	{
		//Do nothing in this case - popping up an error would affect the UX.
	}
	,
	addChatmiumUser: function(fromId, messageOwner)
	{
		if (fromId == -1)
			return;

		var userFound = 0;
		for (var name in this.uniqueUsers)
		{
			if (name == messageOwner)
			{
				userFound = 1;
				break;
			}
		}
		
		if (userFound == 0)
			this.uniqueUsers[messageOwner] = fromId;
	}
	,
	getChatmiumUser: function(userId)
	{
		for (var name in this.uniqueUsers)
		{
			if (this.uniqueUsers[name] == userId)
			{
				return name;
			}
		}
		return "";
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

document.addEventListener('DOMContentLoaded', registerEvents);
document.addEventListener('keypress', filterKeys, false);
window.onresize = handleResize;

function registerEvents()
{
	document.getElementById('setalias').addEventListener('click', getChatName);
	document.getElementById('smileys').addEventListener('click', getChatSmiley);
	document.getElementById('acceptsmiley').addEventListener('click', acceptChatSmiley);
	document.getElementById('closesmiley').addEventListener('click', closeChatSmiley);
	
	document.getElementById('useralias').focus();
	
	//chrome.notifications.onClicked.addListener(clickedCallback);
	
	//Add click handlers to smileys...
	var ul = document.getElementById('smileyitems');
	if (ul)
	{
		for (var i = 0; i < ul.childNodes.length; i++)
		{
			var item = ul.childNodes[i];
			if (item.childNodes.length)	//this should be an anchor node
			{
				var anchor = item.childNodes[0];
				if (anchor)
					anchor.addEventListener('click', appendSmiley);
			}
		}
	}

	gradientPrefix = getCssValuePrefix('backgroundImage', 'linear-gradient(left, #fff, #fff)');
	
	_global_cb = handleResize;	//make sure that handleResize is called when we switch tabs
	tab('interface', 'tab1');	//make sure the correct tab is showing at startup.
}
/*
function creationCallback(notId)
{
	//fake callback for the notification when an event is received.
}

function clickedCallback(notId)
{
	//make this window show - pop to front.
	chrome.app.window.restore();
}
*/
function filterKeys(e)
{
	if (e.keyCode === 13)
	{
		e.preventDefault();	//prevent the enter key from being consumed by the edit control.
		sendMessage();	//send message when user presses the "enter" key.
	}
	return false;
}

function checkPreviousAlias(userName)
{
	var name = document.getElementById("username");
	if (name.innerHTML.length)
		chatFetcher.sendChatmiumMessage("User alias changed to: " + userName);
}

function getChatName()
{
	var chatalias = document.getElementById("useralias");
	var userName = chatalias.value;

	if (userName.length)
	{
		checkPreviousAlias(userName);
		var name = document.getElementById("username");
		if (name)
		{
			name.innerHTML = userName;
			_user_alias = userName;

			tab('interface', 'tab2');	//make sure the correct tab is showing to chat.

			chatFetcher.joinChat(userName);	//start the chatting!
			document.getElementById('usermessage').focus();
		}
	}
	else
	{
		alert('Please enter a user name.');
	}
	return false;
}

function handleResize()
{
	var chat = document.getElementById("chatcontent");
	if (chat)
	{
		chat.style.display = "block";
		var newHeight = document.body.clientHeight - 122;
		if (newHeight >= 0)
			chat.style.height = "" + newHeight +"px";
	}
}

function getChatSmiley()
{
	var smileydiv = document.getElementById('chatsmiley');
	if (smileydiv)
	{
		if (smileydiv.style.display == 'none' || smileydiv.style.display.length == 0)
			smileydiv.style.display = 'block';
		else
			smileydiv.style.display = 'none';
	}
	return false;
}

function acceptChatSmiley()
{
	var smileyinp = document.getElementById('currentsmileys');
	if (smileyinp)
	{
		var input = document.getElementById("usermessage");
		if (input)
		{
			//find insertion point... add smileys there.
			input.value = input.value + smileyinp.value;
		}
		smileyinp.value = '';
	}
	closeChatSmiley();
	document.getElementById('usermessage').focus();
	return false;
}

function appendSmiley(e)
{
	var id = e.currentTarget.id;
	if (id.length)
	{
		var smileyinp = document.getElementById('currentsmileys');
		if (smileyinp)
			smileyinp.value = smileyinp.value + ' -:|' + id + '|:-';
	}
}
function closeChatSmiley()
{
	var smileydiv = document.getElementById('chatsmiley');
	if (smileydiv)	//don't care what the value was before that.
		smileydiv.style.display = 'none';
	return false;
}

function sendMessage()
{
	var input = document.getElementById("usermessage");
	if (input)
	{	//the input area where the message is stored.
		var msg = input.value;	//not sure how that works
		if (msg.length)
		{	//try not to send blank messages - preserve bandwidth
			chatFetcher.sendChat(msg);
			//clear out the text area after we have sent the message.
			input.value = '';
		}
	}
	return false;
}

function setUserText(uploadedfile)
{
	chatFetcher.sendChat('__|' + uploadedfile + '|__');
}

function setErrorText(error)
{
	var parent = document.getElementById('chatitems');
	var li = document.createElement('li');
	li.innerHTML = "<b>Chatmium:  </b>[" + error + "] while uploading file";
	setBubbleColor(li);
	parent.appendChild(li);
}

function setUserId(id)
{
	if (_user_id == -1)
		_user_id = id;
}

function checkallowedExt(filename)
{
	var suffixes = [".jpg", ".jpeg", ".png", ".gif"];
	for (var i = 0; i < suffixes.length; i++)
	{
		if (filename.indexOf(suffixes[i], filename.length - suffixes[i].length) !== -1)
			return true;
	}
	return false;
}

(function() {
	 $('form').ajaxForm({
		beforeSend: function() {
			var filename = document.getElementById("image-file").value;
			var allowed = checkallowedExt(filename);
				if (allowed)
				{
					var loader = document.getElementById("loadingfile");
					if (loader)
						loader.style.display = "block";
				}
		},
		uploadProgress: function(event, position, total, percentComplete) {
		
			var progress = document.getElementById("percentage");
			if (progress)
			{
				var text = "Uploading File: [" + percentComplete + "]% of [" + total + "]";
				progress.innerHTML = text;
			}
		
		},
		success: function() {
		},
		error: function() {
		},
		complete: function(xhr) {
			if (xhr.responseText.length)
				setUserText(xhr.responseText);
			else if (xhr.statusText.length)
				setErrorText(xhr.statusText);

			var loader = document.getElementById("loadingfile");
			if (loader)
				loader.style.display = "none";
		}
	});
})();

function requestMessages()
{
	//shim for the way in which window messages are handled.
	chatFetcher.current_message = chatFetcher.findLastMessage(chatFetcher);
	chatFetcher.current_function = 'fetch';
	chatFetcher.requestChat(0);
}

function playChatSound()
{
	var enableSound = document.getElementById("sounds");
	if (enableSound)
	{
		if (enableSound.checked)
		{
			chatFetcher.audio.volume = 0.5;
			chatFetcher.audio.play();
		}
	}
}


function getCssValuePrefix(name, value) {
    var prefixes = ['', '-o-', '-ms-', '-moz-', '-webkit-'];

    // Create a temporary DOM object for testing
    var dom = document.createElement('div');

    for (var i = 0; i < prefixes.length; i++) {
        // Attempt to set the style
        dom.style[name] = prefixes[i] + value;

        // Detect if the style was successfully set
        if (dom.style[name]) {
            return prefixes[i];
        }
        dom.style[name] = '';   // Reset the style
    }
}

function setBubbleColor(element)
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
/*
function minimizeChatWindow()
{
	chrome.app.window.current().minimize();
}

function closeChatWindow()
{
	chatFetcher.endChat();
	chrome.app.window.current().close();
}
*/
function privatemessage(to_user_id)
{
	_target_user_id = to_user_id;

	var name = document.getElementById("username");
	if (name)
	{
		if (_target_user_id != -1)
		{
			name.innerHTML = _user_alias + "->" + chatFetcher.getChatmiumUser(to_user_id) +  " <a href='javascript:privatemessage(-1)' title='Cancel Private Message'>[x]</a>";	
		}
		else
		{
			name.innerHTML = _user_alias;
		}
	}
}