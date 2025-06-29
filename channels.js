var channels = {};
var socks = null;

this.setOptions = function(opt) {
	opt = opt || {};
	socks = opt.sockets;
}

this.addChannel = function(channel, callback) {
	if(channels[channel] && typeof channels[channel] == 'object') {
		if(typeof callback == 'function') callback(11, 'Channel: "'+channel+'" - already exists');
		console.log('Errno: 11; Message: Channel: "'+channel+'" - already exists');
		return;
	}
	channels[channel] = {};
	if(typeof callback == 'function') callback(0);
}

this.removeChannel = function(channel, callback) {
	delete channels[channel];
	if(typeof callback == 'function') callback(0);
}

this.addListener = function(channel, userid, callback) {// callback(err, data)
	if(!channels[channel] || typeof channels[channel] != 'object') {
		if(typeof callback == 'function') callback(12, 'Channel: "'+channel+'" - NOT FOUND');
		console.log('Errno: 12; Message: Channel: "'+channel+'" - NOT FOUND');
		return;
	}
	channels[channel][userid] = true;
	if(typeof callback == 'function') callback(0);
}

this.removeListener = function(channel, userid, callback) {
	if(!channels[channel] || typeof channels[channel] != 'object') {
		if(typeof callback == 'function') callback(12, 'Channel: "'+channel+'" - NOT FOUND');
		console.log('Errno: 12; Message: Channel: "'+channel+'" - NOT FOUND');
		return;
	}
	delete channels[channel][userid];
	if(typeof callback == 'function') callback(0);
}

this.broadcast = function(channel, userid, callback) {// callback(socket, userid);
	if(!channels[channel] || typeof channels[channel] != 'object') {
		if(typeof callback == 'function') callback(12, 'Channel: "'+channel+'" - NOT FOUND');
		console.log('Errno: 12; Message: Channel: "'+channel+'" - NOT FOUND');
		return;
	}
	for(var id in channels[channel]) {
		if(id == userid) continue;
		if(!socks.sockets[id] || (typeof socks.sockets[id] != 'object' && typeof socks.sockets[id] != 'function')) continue;
		if(typeof socks.sockets[id].on != 'function') console.log('sockets["'+id+'"] - NOT SOCKET');
		if(typeof callback == 'function') callback(socks.sockets[id], userid);
	}
}

this.broadcastAll = function(channel, userid, callback) {// callback(socket, userid);
	if(!channels[channel] || typeof channels[channel] != 'object') {
		if(typeof callback == 'function') callback(12, 'Channel: "'+channel+'" - NOT FOUND');
		return;
	}
	for(var id in channels[channel]) {
		if(!socks.sockets[id] || (typeof socks.sockets[id] != 'object' && typeof socks.sockets[id] != 'function')) continue;
		if(typeof socks.sockets[id].on != 'function') console.log('sockets["'+id+'"] - NOT SOCKET');
		if(typeof callback == 'function') callback(socks.sockets[id], userid);
	}
}
