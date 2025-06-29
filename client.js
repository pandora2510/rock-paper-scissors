function mt_rand (min, max) {
    // http://kevin.vanzonneveld.net
    // +   original by: Onno Marsman
    // *     example 1: mt_rand(1, 1);
    // *     returns 1: 1
    var argc = arguments.length;
    if (argc === 0) {
        min = 0;
        max = 2147483647;
    } else if (argc === 1) {
        throw new Error('Warning: mt_rand() expects exactly 2 parameters, 1 given');
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

$(document).ready(function() {

	var PORT = '8081';
	var socket = io.connect('http://localhost:'+PORT);
	
	var game = null;
	var list = new listGames($);
	
	socket.on('add-game', function(data) {
		console.log('Event: add-game');
		
		data = data || {};
		
		list.addGame(data);
		
	});
	
	socket.on('del-game', function(data) {
		console.log('Event: del-game');
		
		data = data || {};
		
		list.removeGame(data.id);
		
	});
	
	socket.on('add-gamer', function(data) {
		console.log('Event: add-gamer');
		
		data = data || {};
		
		if(game && typeof game == 'object') {
			game.addGamer(data);
		} else {
			list.addGamer(data);
		}
		
	});
	
	socket.on('del-gamer', function(data) {
		console.log('Event: del-gamer');
		
		data = data || {};
		
		if(game && typeof game == 'object') {
			game.removeGamer(data);			
		} else {
			list.removeGamer(data);
		}
		
	});
	
	socket.on('add-viewer', function(data) {
		console.log('Event: add-viewer');
		
		data = data || {};
		
		if(game && typeof game == 'object') {
			game.addViewer(data);
		} else {
			list.addViewer(data);
		}
		
	});
	
	socket.on('del-viewer', function(data) {
		console.log('Event: del-viewer');
		
		data = data || {};
		
		if(game && typeof game == 'object') {
			game.removeViewer(data);			
		} else {
			list.removeViewer(data);
		}
		
	});
	
	socket.on('get-list', function(data) {
		console.log('Event: get-list');
		
		data = data || {};
		
		list.getListGames(data);
		
	});
	
	socket.on('get-param', function(data) {
		console.log('Event: get-param');
		
		data = data || {};
		
		game.setParam(data);
		
		console.log(data);
	});
	
	socket.on('step', function(data) {
		console.log('Event: step');
		
		game.step(data);
		
	});
	
	socket.on('new-part', function(data) {
		console.log('Event: new-part');
		
		data = data || {};
		
		game.newPart(data);
		
	});
	
	socket.on('kill', function(data) {
		console.log('Event: kill');
		
		game.__destroy();
		
		game = null;
		
	});
	
	function list_games() {
		console.log('Emit: get-list');
		socket.emit('get-list', {});
	}
	
	$(document.body).bind('click', function(e) {
		e.stopPropagation();
		
		var attr = $(e.target).attr('data-click');
		if(!attr) return;
		
		var gname;
		
		if(attr == 'new-game') {
			
			gname = (new Date()).getTime()+''+mt_rand(0,9999);
			game = new Game({privilege: 2, gameid: gname, userid: socket.socket.sessionid}, $);
			console.log('Emit: new-game');
			socket.emit('new-game', {gameid: gname});
			
		} else if(attr == 'game-game') {
			
			gname = ($(e.target).parent().parent().parent().parent().attr('id')+'').substr(5);
			game = new Game({privilege: 1, gameid: gname, userid: socket.socket.sessionid}, $);
			console.log('Emit: enter-gamer');
			socket.emit('enter-gamer', {gameid: gname});
			
		} else if(attr == 'game-view') {
			
			gname = ($(e.target).parent().parent().parent().parent().attr('id')+'').substr(5);
			game = new Game({privilege: 0, gameid: gname, userid: socket.socket.sessionid}, $);
			console.log('Emit: enter-viewer');
			socket.emit('enter-viewer', {gameid: gname});
			
		} else if(attr == 'exit') {
			
			gname = $('#game-num .name-game').html();
			console.log('Emit: exit');
			socket.emit('exit', {gameid: gname});
			game = null;
			
		} else if(attr == 'throw') {
			
			gname = $('#game-num .name-game').html();
			
			var value = game.a_stop($('#game-num #user-value2').get(0));
			
			console.log('Emit: course');
			socket.emit('course', {gameid: gname, val: value});
			console.log('THROW: '+value);
			
		} else if(attr == 'newpart') {
			
			gname = $('#game-num .name-game').html();
			
			console.log('Emit: new-part');
			socket.emit('new-part', {gameid: gname});
			
		}
	});
	
	list_games();

});
