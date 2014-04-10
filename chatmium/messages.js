/*
messages.js - all functions related to chatmium messages go in this file.

Written by Mogamat Shaheed Abdol Copyright 2014.
*/

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

chatMessage.prototype.getOwnerLink = function(obj, callback)
{	//can only private message users after they have their id's
	if (this.messageText == "has joined the room!")	//cannot link to message when user joins a room
		return this.messageOwner;
	else
	{
		callback(obj, this.fromId, this.messageOwner);
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


function parseOldMessage(obj, callback, remainingContent)
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
			messageAdded = callback(obj, substr, -1, -1);
			pos2 += 7;
		}
	}
	return [remainingContent.substr(pos2), messageAdded];
}

function parseNewMessage(obj, callback, messageType, remainingContent)
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
				messageAdded = callback(obj, substr, fromto[0], fromto[1]);
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