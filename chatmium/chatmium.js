/*
chatmium.js - Written by Mogamat Shaheed Abdol, Copyright 2014.

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

//[Depends] on [messages.js]
//[Depends] on [chatfetcher.js]

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

	var ul = document.getElementById('smileyitems');
	if (ul)
	{	//Add click handlers to smileys...
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
		chatFetcher.sendChatmiumMessage(privatemessage, "User alias changed to: " + userName);
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
			chatFetcher.joinChat(requestMessages, userName);	//start the chatting!
			document.getElementById('usermessage').focus();
		}
	}
	else
		alert('Please enter a user name.');

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
		if (input)	//find insertion point... add smileys there.
			input.value = input.value + smileyinp.value;

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
			chatFetcher.sendChat(privatemessage, msg);
			input.value = '';	//clear out the text area after we have sent the message.
		}
	}
	return false;
}

function setUserText(uploadedfile)
{
	chatFetcher.sendChat(privatemessage, '__|' + uploadedfile + '|__');
}

function setErrorText(error)
{
	var parent = document.getElementById('chatitems');
	var li = document.createElement('li');
	li.innerHTML = "<b>Chatmium:  </b>[" + error + "] while uploading file";
	chatFetcher.setBubbleColor(li);
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
		success: function() {},
		error: function() {},
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
{	//shim for the way in which window messages are handled.
	chatFetcher.current_message = chatFetcher.findLastMessage(chatFetcher);
	chatFetcher.current_function = 'fetch';
	chatFetcher.requestChat();
}

function getCssValuePrefix(name, value)
 {
    var prefixes = ['', '-o-', '-ms-', '-moz-', '-webkit-'];
    var dom = document.createElement('div');    // Create a temporary DOM object for testing

    for (var i = 0; i < prefixes.length; i++)
	{   // Attempt to set the style
        dom.style[name] = prefixes[i] + value;
    
        if (dom.style[name])    // Detect if the style was successfully set
            return prefixes[i];

        dom.style[name] = '';   // Reset the style
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
	if (name == 0 || name == null)
		return;

	if (_target_user_id != -1)
	{
		name.innerHTML = _user_alias + "->" + chatFetcher.getChatmiumUser(chatFetcher, to_user_id) +  " <a href='javascript:privatemessage(-1)' title='Cancel Private Message'>[x]</a>";	
	}
	else
		name.innerHTML = _user_alias;
}

function toggle(el)
{
    if (el.title == "Sound Off")
    {
        el.src = 'ui/speaker_off.png';
        el.title = "Sound On";
		chatFetcher._sound_state = 0;
    }
    else if (el.title == "Sound On")
    {
        el.src = 'ui/speaker_on.png';
        el.title = "Sound Off";
		chatFetcher._sound_state = 1;
    }
    return false;
}

function tab(className, tab)
{
	var elements = document.getElementsByClassName(className);
	for (var i = 0; i < elements.length; i++)
	{
		elements[i].style.display = "none";	//hide the tab
		document.getElementById('label_tab' + (i + 1)).setAttribute("class", "");	//set the list item to "inactive"
	}

	document.getElementById(tab).style.display = 'block';
	document.getElementById('label_' + tab).setAttribute("class", "active");
	
	handleResize();
}
