this.Game = function(user_id, game_id) {
	
	var game = {
		id:game_id,
		name:null,
		author:user_id,
		gamers:[user_id],
		viewers:[],
		account:{},// userid:value, ...
		steps:{},// userid:value
		maxCount:2,
		lastPartWin:[],// userid,...
		engine:{
			'rock':{win:['scissors'], lose:['paper'], draw:['rock']},
			'paper':{win:['rock'], lose:['scissors'], draw:['paper']},
			'scissors':{win:['paper'], lose:['rock'], draw:['scissors']}
		},
	};
	
	
	// addGamer
	this.addGamer = function(userid, callback) {
		game.gamers.push(userid);
		if(typeof callback == 'function') callback(0);
	}

	// removeGamer
	this.removeGamer = function(userid, callback) {
		console.log(game.gamers);
		var index = helper_get_index(game.gamers, userid);
		if(index !== false) {
			game.gamers.splice(index,1);
		}
		delete game.steps[userid];
		delete game.account[userid];
		console.log(game.gamers);
		if(typeof callback == 'function') callback(0);
	}

	// addViewer
	this.addViewer = function(userid, callback) {
		game.viewers.push(userid);
		if(typeof callback == 'function') callback(0);
	}

	// removeViewer
	this.removeViewer = function(userid, callback) {
		console.log(game.viewers);
		var index = helper_get_index(game.viewers, userid);console.log('INDEX: '+index);
		if(index !== false) {
			game.viewers.splice(index,1);
		}
		console.log(game.viewers);
		if(typeof callback == 'function') callback(0);
	}

	// getStatic
	this.getStatic = function(userid, callback) {
		var game0 = {};
		
		game0.id = game.id;
		game0.gamers = game.gamers;
		game0.viewers = game.viewers;
		game0.account = game.account;
		game0.maxCount = game.maxCount;
		if(game.maxCount > helper_obj_count(game.steps)) {
			
			game0.steps = {};
			for(var i in game.steps) {
				game0.steps[i] = 'wait';// wait!!!
			}
			
			game0.lastPartWin = [];
		} else {
			game0.lastPartWin = game.lastPartWin;
			game0.steps = game.steps;
		}
		
		if(typeof callback == 'function') { callback(0, game0); return; }
		return game0;
	}

	// step
	this.step = function(userid, value, callback) {console.log('STEP: userid: '+userid+'; value: '+value);
	
		if(userid != game.author && !helper_in_array(game.gamers, userid)) {
			if(typeof callback == 'function') callback(2);
			console.log('Errno: 2; Message: user "'+userid+'" is not GAMER');
			return;
		}
		var j = false;
		for(var i in game.engine) if(i == value) j = true;
		if(!j) {
			if(typeof callback == 'function') callback(3);
			return;
		}
		game.steps[userid] = value;
		
		// определяем победителя
		var result = null;
		var steps0 = {};
		if(game.maxCount == helper_obj_count(game.steps)) {console.log('STEP: search win;');console.log(game.steps);
			
			var userid2 = null;
			for(var i in game.steps) {
				if(i == userid) continue;
				userid2 = i;
			}
			result = checkWin(game ,userid, userid2);
			
			steps0[userid] = game.steps[userid];
			steps0[userid2] = game.steps[userid2];
			
		} else {
			steps0[userid] = 'wait';// wait!!!
		}
		console.log('Object: account');
		console.log(game.account);
		
		if(typeof callback == 'function') callback(0, {steps:steps0, result:result});
	}

	// new part
	this.newPart = function(userid, callback) {// + вернуть счет
		if(userid != game.author) {
			if(typeof callback == 'function') callback(1);
			console.log('Errno: 2; Message: user "'+userid+'" is not AUTHOR');
			return;
		}
		
		game.steps = {};
		game.lastPartWin = [];
		
		if(typeof callback == 'function') callback(0, game.account);
	}
	
	// isViewer
	this.isAuthor = function(userid, callback) {
		if(userid == game.author) return true; else return false;
	}
	
	// isGamer
	this.isGamer = function(userid, callback) {
		if(helper_in_array(game.gamers, userid)) return true; else return false;
	}
	
	this.getGamers = function() {
		return game.gamers.length;
	}
	
	this.getViewers = function() {
		return game.viewers.length;
	}
	
	this.getMaxCount = function() {
		return game.maxCount;
	}

}
// ...

// helpers
function checkWin(gamex ,userid1, userid2) {
	if(!userid1 || !userid2) return null;
	
	var result = {};
	
	if(helper_in_array(gamex.engine[gamex.steps[userid1]].win, gamex.steps[userid2])) {
		gamex.lastPartWin.push(userid1);
		result[userid1] = 'win';
		result[userid2] = 'lose';
	}
	
	if(helper_in_array(gamex.engine[gamex.steps[userid1]].lose, gamex.steps[userid2])) {
		gamex.lastPartWin.push(userid2);
		result[userid1] = 'lose';
		result[userid2] = 'win';
	}
	
	if(helper_in_array(gamex.engine[gamex.steps[userid1]].draw, gamex.steps[userid2])) {
		result[userid1] = 'draw';
		result[userid2] = 'draw';
	}
	
	console.log('lastPartWin');
	console.log(gamex.lastPartWin);

	for(var i=0; i<gamex.lastPartWin.length; i++) {
		if(!gamex.account[gamex.lastPartWin[i]] || gamex.account[gamex.lastPartWin[i]] < 0) gamex.account[gamex.lastPartWin[i]] = 0;
		gamex.account[gamex.lastPartWin[i]] = gamex.account[gamex.lastPartWin[i]] + 1;
	}
	console.log('Object: account');
	console.log(gamex.account);
	
	return result;
}

function helper_obj_count(obj) {
	var count = 0;
	for(var i in obj) ++count;
	return count;
}

function helper_in_array(array, value) {
	for(var i=0; i<array.length; i++) {
		if(array[i] == value) return value;
	}
	return false;
}

function helper_get_index(array, value) {
	for(var i=0; i<array.length; i++) {
		if(array[i] == value) return i;
	}
	return false;
}
