process.on('uncaughtException', function (err) {
	console.log('Caught exception: ' + err);
});

var PORT = '8081';
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')

app.listen(PORT);

// mini-http server
function handler (req, res) {
	var url = require('url').parse(req.url);
	fs.readFile(__dirname + (url.pathname=='/'?'/index.html':url.pathname), function (err, data) {
    	if (err) {
    		console.log(err);
      		res.writeHead(500);
      		return res.end('Error loading index.html');
    	}

    	res.writeHead(200);
    	res.end(data);
	});
}


// каналы данных
var streams = require('./channels.js');
streams.setOptions({sockets:io.sockets});

// games
var listGames = require('./listGames.js');
var Game = require('./game.js').Game;// class Game

streams.addChannel('event-list-games');

// socket.io server
io.sockets.on('connection', function(socket) {// тестировать!!!
	
	// создание новой игры
	socket.on('new-game', function(data) {// {gameid}
		data = data || {};
		
		var game = new Game(socket.id, data.gameid);
		listGames.addGame(data.gameid, game);
		
		var chGame = 'event-game-'+data.gameid;
		
		streams.addChannel(chGame);
		streams.addListener(chGame, socket.id);
		streams.removeListener('event-list-games', socket.id);
		
		game.getStatic(socket.id, function(err, data0) {
			
			console.log('Event: get-param; Userid: '+socket.id);
			socket.emit('get-param', data0);
			
			streams.broadcast('event-list-games', socket.id, function(socket0, userid) {
				console.log('Event: add-game; Userid: '+socket0.id);
				socket0.emit('add-game', {id: data0.id, gamers: data0.gamers.length, viewers: data0.viewers.length, maxCount: data0.maxCount});
			});
			
		});
		
	});
	
	// вход в игру зрителя
	socket.on('enter-viewer', function(data) {// {gameid}
		data = data || {};
		
		var chGame = 'event-game-'+data.gameid;
		
		streams.addListener(chGame, socket.id);		
		streams.removeListener('event-list-games', socket.id);
		
		listGames.getGame(data.gameid, function(err, game) {
			game.addViewer(socket.id);
			
			game.getStatic(socket.id, function(err, data0) {
			
				console.log('Event: get-param; Userid: '+socket.id);
				socket.emit('get-param', data0);
			
				streams.broadcast('event-list-games', socket.id, function(socket0, userid) {
					console.log('Event: add-viewer; Userid: '+socket0.id);
					socket0.emit('add-viewer', {id: data0.id, viewers: data0.viewers.length});
				});
				
				streams.broadcast(chGame, socket.id, function(socket0, userid) {
					console.log('Event: add-viewer; Userid: '+socket0.id);
					socket0.emit('add-viewer', {id: data0.id, viewers: data0.viewers.length});
				});
			});
			
		});
	});
	
	// вход в игру игрока
	socket.on('enter-gamer', function(data) {// {gameid}
		data = data || {};
		
		var chGame = 'event-game-'+data.gameid;
		
		streams.addListener(chGame, socket.id);		
		streams.removeListener('event-list-games', socket.id);
		
		listGames.getGame(data.gameid, function(err, game) {
			game.addGamer(socket.id);
			
			game.getStatic(socket.id, function(err, data0) {
			
				console.log('Event: get-param; Userid: '+socket.id);
				socket.emit('get-param', data0);
			
				streams.broadcast('event-list-games', socket.id, function(socket0, userid) {
					console.log('Event: add-gamer; Userid: '+socket0.id);
					socket0.emit('add-gamer', {id: data0.id, gamers: data0.gamers.length, maxCount: data0.maxCount});
				});
				
				streams.broadcast(chGame, socket.id, function(socket0, userid) {
					console.log('Event: add-gamer; Userid: '+socket0.id);
					socket0.emit('add-gamer', {id: data0.id, gamer: socket.id, gamers: data0.gamers.length});
				});
				
			});
			
		});
	});
	
	// запрос списока всех игр
	socket.on('get-list', function(data) {// {}
		
		streams.addListener('event-list-games', socket.id);
		
		listGames.getListGames(socket.id, function(err, data0) {
			
			socket.emit('get-list', data0);
			console.log('Event: get-list; Userid: '+socket.id);
			
		});
	});
	
	// уведомление о начале новой партии
	socket.on('new-part', function(data) {// gameid, +вернуть счет
		
		data = data || {};
		
		var chGame = 'event-game-'+data.gameid;
		
		listGames.getGame(data.gameid, function(err, game) {
		
			if(!game || typeof game != 'object') return;
		
			game.newPart(socket.id, function(err, acc) {
				
				streams.broadcastAll(chGame, socket.id, function(socket0, userid) {
					console.log('Event: new-part; Userid: '+socket0.id);
					socket0.emit('new-part', {id: data.gameid, account: acc});
				});
				
			});
			
		});
		
	});
	
	// ходы игроков
	socket.on('course', function(data) {// gameid, value
		
		data = data || {};
		
		var chGame = 'event-game-'+data.gameid;
		
		listGames.getGame(data.gameid, function(err, game) {
		
			if(!game || typeof game != 'object') return;
			
			game.step(socket.id, data.val, function(err, data0) {console.log('STEP ERRNO: '+err+';');console.log(data0);
				
				data0.id = data.gameid;
				
				if(data0.result === null) {
					streams.broadcast(chGame, socket.id, function(socket0, userid) {
						console.log('Event: step; Userid: '+socket0.id);
						socket0.emit('step',data0);
					});
				} else {
					streams.broadcastAll(chGame, socket.id, function(socket0, userid) {
						console.log('Event: step; Userid: '+socket0.id);
						socket0.emit('step',data0);
					});
				}
				
			});
			
		});
		
	});
	
	// кто-то выходит из игры
	socket.on('exit', function(data) {// gameid
		
		data = data || {};
		
		var chGame = 'event-game-'+data.gameid;
		
		streams.removeListener(chGame, socket.id);
		
		listGames.getGame(data.gameid, function(err, game) {
		
			if(game && typeof game == 'object') {
			
			if(game.isAuthor(socket.id)) {
				// убыйство игры
				listGames.removeGame(data.gameid);
				
				streams.broadcast('event-list-games', socket.id, function(socket0, userid) {
					console.log('Event: del-game; Userid: '+socket0.id);
					socket0.emit('del-game', {id: data.gameid});
				});
				
				streams.broadcast(chGame, socket.id, function(socket0, userid) {
					console.log('Event: kill; Userid: '+socket0.id);
					socket0.emit('kill', {id: data.gameid});
				});
				
				streams.removeChannel(chGame);
				
			} else if(game.isGamer(socket.id)) {
			
				// выход из игры игрока
				game.removeGamer(socket.id);
				
				streams.broadcast('event-list-games', socket.id, function(socket0, userid) {
					console.log('Event: del-gamer; Userid: '+socket0.id);
					socket0.emit('del-gamer', {id: data.gameid, gamers: game.getGamers(), maxCount: game.getMaxCount()});
				});
				
				streams.broadcast(chGame, socket.id, function(socket0, userid) {
					console.log('Event: del-gamer; Userid: '+socket0.id);
					socket0.emit('del-gamer', {id: data.gameid, userid: socket.id, gamers: game.getGamers()});
				});
				
			} else {
				
				// выход зрителя
				game.removeViewer(socket.id);
				
				streams.broadcast('event-list-games', socket.id, function(socket0, userid) {
					console.log('Event: del-viewer; Userid: '+socket0.id);
					socket0.emit('del-viewer', {id: data.gameid, viewers: game.getViewers()});
				});
				
				streams.broadcast(chGame, socket.id, function(socket0, userid) {
					console.log('Event: del-viewer; Userid: '+socket0.id);
					socket0.emit('del-viewer', {id: data.gameid, userid: socket.id, viewers: game.getViewers()});
				});
				
			}
			
			}
			
			// отсылка содержимого со списком игр
			streams.addListener('event-list-games', socket.id);
			listGames.getListGames(socket.id, function(err, data0) {
			
				socket.emit('get-list', data0);
				console.log('Event: get-list; Userid: '+socket.id);
			
			});			
			
		});
	});
	
});
