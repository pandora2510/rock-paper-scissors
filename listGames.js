var games = {};

this.addGame = function(gameid, game, callback) {
	if(games[gameid] && typeof games[gameid] == 'object') {
		if(typeof callback == 'function') callback(1);
		console.log('Errno: 1; Message: game "'+gameid+'" - already exists');
		return;
	}
	games[gameid] = game;
}

this.removeGame = function(gameid, callback) {
	delete games[gameid];
	if(typeof callback == 'function') callback(0);
}

this.getGame = function(gameid, callback) {
	if(games[gameid] && typeof games[gameid] == 'object') {
		if(typeof callback == 'function') { callback(0, games[gameid]); return; }
		return games[gameid];
	} else {
		if(typeof callback == 'function') callback(2);
		console.log('Errno: 1; Message: game "'+gameid+'" - NOT FOUND');
	}
}

this.getListGames = function(userid, callback) {
	if(typeof callback == 'function') {
		var arr = {};
		for(var i in games) {
			arr[i] = games[i].getStatic(userid);
		}
		callback(0, arr);
	}
}
