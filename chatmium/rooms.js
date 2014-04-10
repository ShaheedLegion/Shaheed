/*rooms.js - written by Mogamat Shaheed Abdol, copyright 2014.*/

//[Depends] on [messages.js]

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
{
	//create a list element which will store the messages.
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

room.prototype.addMessage(privPrefix, messObj, tomsg)
{
	var parent = document.getElementById('list' + this.roomId);	
	var li = document.createElement('li');
	li.innerHTML = privPrefix + "<b>" + messObj.getOwnerLink(this.userHandler, this.userHandler.addChatmiumUser) + tomsg +  ":  </b>" + messObj.messageText;
	setBubbleColor(li);
	parent.appendChild(li);
	this.messages.push(messObj);
}

roomHandler = function()
{
	this.rooms = new Array();
	this.uniqueUsers = {};
}

roomHandler.prototype.addChatmiumUser()
{
}

roomHandler.prototype.addMessage(fromid, privPrefix, messObj, tomsg)
{
	//find room with matching id ... add message to room
	for (var i = 0; i < this.rooms.length; i++)
	{
		if (this.rooms[i].userId == fromid)
		{
			this.rooms[i].addMessage(privPrefix, messObj, tomsg);
			return;
		}
	}
	//if room was not found, then generate new room, add to list and append message
	var roomId = ;	//generate room id here
	var newRoom = new room(fromid, roomId, this);
	newRoom.addMessage(privPrefix, mesObj, tomsg);
	this.rooms.append(newRoom);
}