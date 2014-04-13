/*rooms.js - written by Mogamat Shaheed Abdol, copyright 2014.*/
//[Depends] on [messages.js]

Object.prototype.removeItem = function (key)	//need a shim to remove items from the array properly.
{
   if (!this.hasOwnProperty(key))
      return;
   if (isNaN(parseInt(key)) || !(this instanceof Array))
      delete this[key];
   else
      this.splice(key, 1);
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

		colr = Math.floor(200 + (Math.random() * 55));		//repeat for compatible browsers
		colg = Math.floor(200 + (Math.random() * 55));
		colb = Math.floor(200 + (Math.random() * 55));
		
		var endColString = "rgb(" + colr + "," + colg + "," + colb + ")"
		element.style.backgroundImage = gradientPrefix + 'linear-gradient(' + 'bottom' + ', ' + endColString + ' 25%, ' + colString + ' 100%)';
	}
}

room = function(userid, roomId, handler)
{
	this.messages = new Array();
	this.lastMessage = -1
	this.userId = userid;
	this.userHandler = handler;
	this.roomId = roomId;
	this.roomElement = 0;

	this.createRoomElement();
}

room.prototype.createRoomElement = function()
{	//create a list element which will store the messages.
	var div = document.createElement('div');	//create the parent div.
	div.className = 'chatcontent';
	div.id = '' + this.roomId;
	
	var list = document.createElement('ul');
	list.className = 'chatitems';
	list.id = 'list' + this.roomId;

	div.appendChild(list);

	var privateTab = document.getElementById('privatechatwrapper');
	privateTab.appendChild(div);
}

room.prototype.addMessage = function(privPrefix, messObj, tomsg)
{
	var parent = document.getElementById('list' + this.roomId);	
	var li = document.createElement('li');
	li.innerHTML = privPrefix + "<b>" + messObj.getOwnerLink(this.userHandler, this.userHandler.addChatmiumUser) + tomsg +  ":  </b>" + messObj.messageText;
	setBubbleColor(li);
	parent.appendChild(li);
	
	if (messObj.type == 'remove')
		this.userHandler.removeChatmiumUser(messObj.fromId);
	
	this.messages.push(messObj);
}

room.prototype.highestMessage = function(obj)
{
	var highest = 0;
	for (var i = 0; i < obj.messages.length; i++)
	{
		if (obj.messages[i].messageNumber > highest)
			highest = obj.messages[i].messageNumber;
	}
	return highest;
}

/**************************RoomHandler*****************************/
roomHandler = function()
{
	this.rooms = new Array();
	this.uniqueUsers = {};
}

roomHandler.prototype.addChatmiumUser = function(obj, fromId, messageOwner)
{
	if (fromId == -1)	//this means "everyone", so we don't store it uniquely
		return;

	var userFound = 0;
	for (var name in obj.uniqueUsers)
	{
		if ((name == messageOwner) && (obj.uniqueUsers[name] == fromId))
			return;	//escape is duplicate name and id is found, else add the user to our list.
	}

	obj.uniqueUsers[messageOwner] = fromId;
}

roomHandler.prototype.getChatmiumUser = function(userId)
{
	for (var name in this.uniqueUsers)
	{
		if (this.uniqueUsers[name] == userId)
			return name;
	}
	return "";
}

roomHandler.prototype.removeChatmiumUser = function(userId)	//for when users leave the room.
{
	for (var name in this.uniqueUsers)
	{
		if (this.uniqueUsers[name] == userId)
		{
			this.uniqueUsers.removeItem(name);
			break;
		}
	}
}

roomHandler.prototype.enumerateChatmiumUsers = function(element)
{	//pass a list of all unique users to the element.
	for (var name in this.uniqueUsers)
	{
		if (name == "removeItem")	//do not add our prototype to the user list.
			continue;
		var item = document.createElement('li');
		item.innerHTML = "<a href='javascript:startPrivateChat(" + this.uniqueUsers[name] + ")' title='Enter private chat'>" + name + "</a>"
		element.appendChild(item);
	}
}

roomHandler.prototype.addMessage = function(obj, fromid, privPrefix, messObj, tomsg)
{	//find room with matching id ... add message to room
	for (var i = 0; i < obj.rooms.length; i++)
	{
		if (obj.rooms[i].userId == fromid)
		{
			obj.rooms[i].addMessage(privPrefix, messObj, tomsg);
			return;
		}
	}	//if room was not found, then generate new room, add to list and append message

	var roomString = fromid + '--' + (new Date().getTime()) + '' + (((Math.random() + 1) * 133245723) % 3416557); //generate room id here, nothing fancy, just try not to clash
	var roomId = roomString.replace('.', '');
	var newRoom = new room(fromid, roomId, obj);

	newRoom.addMessage(privPrefix, messObj, tomsg);
	obj.rooms.push(newRoom);
}

roomHandler.prototype.findHighestMessage = function(obj, userid)
{
	var highest = 0;
	for (var i = 0; i < obj.rooms.length; i++)
	{
		if (obj.rooms[i].userId == userid)
		{
			highest = obj.rooms[i].highestMessage(obj.rooms[i]);
			return highest;
		}
	}
	return 0;
}