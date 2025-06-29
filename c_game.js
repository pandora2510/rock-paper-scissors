function Game(options, $) {

	options = options || {};
	
	var self = this;

	var game = {
		privilege:options.privilege || 0,
		id:options.gameid,
		user1:null,
		user2: options.privilege>0?options.userid:null,
		steps:{},
		engine:['rock', 'paper', 'scissors']
	}
	
	var cache = {};
	
	// анимация
	
	this.a_start = function(el) {
	
		if(($(el).attr('data-status')+'').length < 1) {
			$(el).attr('data-value', game.engine[0]).css('background-image', 'url(./'+game.engine[0]+'.jpg)');
		}
	
		$(el).attr('data-status', 'play');
	
		cache[el.id] = setInterval(function() {
		
			if($(el).attr('data-status') != 'play') return;
			
			var val = $(el).attr('data-value');
			if(val == game.engine[0]) $(el).attr('data-value', game.engine[1]).css('background-image', 'url(./'+game.engine[1]+'.jpg)');
			else if(val == game.engine[1]) $(el).attr('data-value', game.engine[2]).css('background-image', 'url(./'+game.engine[2]+'.jpg)');
			else if(val == game.engine[2]) $(el).attr('data-value', game.engine[0]).css('background-image', 'url(./'+game.engine[0]+'.jpg)');
			else $(el).attr('data-value', game.engine[0]).css('background-image', 'url(./'+game.engine[0]+'.jpg)');
			
		}, 500);
	}
	
	this.a_stop = function(el, value) {console.log('stop: 0');
		
		if(value) {
			var j = false;
			for(var i=0; i<game.engine.length; i++) if(game.engine[i] == value) j = true;
			if(!j) return null;
		}
		console.log('stop: 1');
		$(el).attr('data-status', 'stop');
		
		clearInterval(cache[el.id]);		
		console.log('stop: 2');
		if(value) {
			$(el).attr('data-value', value).css('background-image', 'url(./'+value+'.jpg)');
			console.log('stop: 2a');
			return value;
		} else {
			console.log('stop: 2b');
			return $(el).attr('data-value');
		}
		
	}
	
	this.a_wait = function(el) {console.log('wait: 0');console.log(el);
		
		clearInterval(cache[el.id]);
		
		$(el).attr('data-status', 'wait');
		
		$(el).attr('data-value', 'wait').css('background-image', 'url(./wait.png)');
		console.log('wait: 1');		
	}
	
	function __construct() {
		// загрузка игры и тд
		// запуск анимации
		
	}
	
	__construct();
	
	
	
	this.setParam = function(game0) {
		gameArg = {};
		
		gameArg.gamers = game0.gamers.length || '0';
		gameArg.viewers = game0.viewers.length || '0';
		gameArg.id = game0.id;
		
		if(game.privilege == 2) {
					
			gameArg.user1 = '';
			gameArg.user2 = game.user2+'(You)';
			gameArg.gamer = true;
			gameArg.userAcc1 = '0';
			gameArg.userAcc2 = '0';
			
			// steps
			
		} else if(game.privilege === 1) {
			
			gameArg.user1 = (game.user2!=game0.gamers[0]?game0.gamers[0]:game0.gamers[1]) || '';
			gameArg.user2 = game.user2+'(You)';
			gameArg.gamer = true;
			
			//game.user1 = (game.user2!=game0.gamers[0]?game0.gamers[0]:game0.gamers[1]) || null;
						
			// steps
			console.log(game0);			
			
		} else {
		
			gameArg.user1 = game0.gamers[0] || '';
			gameArg.user2 = game0.gamers[1] || '';
			gameArg.gamer = false;
			
			//game.user1 = game0.gamers[0] || null;
			//game.user2 = game0.gamers[1] || null;
			
			// steps
			console.log(game0);
			
		}
		
		if(game.privilege < 2) {
			
			gameArg.userAcc1 = game0.account[gameArg.user1] || '0';
			gameArg.userAcc2 = game0.account[gameArg.user2] || '0';
			
		}
		
		if(game.privilege > 0) {
			if(game0.gamers[0] == game.user2) {
				game.user1 = game0.gamers[1];
			} else if(game0.gamers[1] == game.user2) {
				game.user1 = game0.gamers[0];
			}
		} else {
			game.user1 = game0.gamers[0] || null;
			game.user2 = game0.gamers[1] || null;
		}
		
		$(document.body).html(new EJS({url: '/tpl-3.ejs'}).render(gameArg));
		
		// запуск анимации
		self.a_start($('#game-num #user-value1').get(0));
		self.a_start($('#game-num #user-value2').get(0));
		
		var partEnd = 0;
		
		if(game.privilege < 2) {
			
			if(game0.steps[game.user1]) {console.log('throw user1;');
				
				if(game0.steps[game.user1] == 'wait') self.a_wait($('#game-num #user-value1').get(0));
				else {self.a_stop($('#game-num #user-value1').get(0), game0.steps[game.user1]); ++partEnd;}
				
			}
			if(game0.steps[game.user2]) {console.log('throw user2;');
			
				if(game0.steps[game.user2] == 'wait') self.a_wait($('#game-num #user-value2').get(0));
				else {self.a_stop($('#game-num #user-value2').get(0), game0.steps[game.user2]); ++partEnd}
				
			}
			
		}
		
		// вывод сообщения для победителя!!!
		if(partEnd >= 2) {
			
			console.log(game0.lastPartWin);
			var msg = '';
			if(game0.lastPartWin.length > 0) {
				for(var i=0; i<game0.lastPartWin.length; i++) msg += game0.lastPartWin[i]+' - WIN<br />';
			} else {
				msg = 'DRAW';
			}
			$(document.body).append($(new EJS({url: '/tpl-4.ejs'}).render({msg:'<span style="font-size: 24px;">'+msg+'</span>', author:game.privilege==2?true:false})));
			
		}
		
		
	}
	
	this.__destroy = function() {
	
		$(document.body).append($(new EJS({url: '/tpl-4.ejs'}).render({msg:'<span style="font-size: 36px;">Game Killed!!!</span>', author:false})));
		
		$('#wait .t3').append($('<input type="button" data-click="exit" value="exit" />'));
		
		self.a_stop($('#game-num #user-value1').get(0));
		self.a_stop($('#game-num #user-value2').get(0));
		
	}
	
	this.addGamer = function(data) {console.log('ADD-GAMER');
		
		data = data || {};
		
		if(game.privilege > 0) {
			game.user1 = data.gamer;
			$('#game-num #user1').html(game.user1);
		} else {
			
			console.log('User1: '+game.user1+'; User2: '+game.user2+';');
			
			if(!game.user2) {console.log('User: '+data.gamer+'; num: 2;');
				game.user2 = data.gamer;
				$('#game-num #user2').html(game.user2);
			} else if(!game.user1) {console.log('User: '+data.gamer+'; num: 1;');
				game.user1 = data.gamer;
				$('#game-num #user1').html(game.user1);
			}
		}
		
		$('#game-num #gamers-game').html(data.gamers);
		
	}
	
	this.removeGamer = function(data) {
		
		data = data || {};
		
		var j = 0;
		
		console.log('Userid: '+data.userid);
		console.log('User1: '+game.user1+'; User2: '+game.user2+';');
		
		if(data.userid == game.user2) {j = 2; game.user2 = null;}
		else if(data.userid == game.user1) {j = 1; game.user1 = null;}
		
		$('#game-num #user'+j).html('');
		$('#game-num #gamers-game').html(data.gamers);
		$('#game-num #user-acc'+j).html('0');
		
		delete game.steps[data.userid];
		
		console.log('User1: '+game.user1+'; User2: '+game.user2+';');
		
	}
	
	this.addViewer = function(data) {console.log('ADD-VIEWER');
		
		data = data || {};
		$('#game-num #viewers-game').html(data.viewers);
		
	}
	
	this.removeViewer = function(data) {console.log(data);
		
		data = data || {};
		$('#game-num #viewers-game').html(data.viewers);
		
	}
	
	this.step = function(data) {console.log(data);
		
		data = data || {};
		
		if(data.result && typeof data.result == 'object') {
			
			if(data.steps[game.user1]) self.a_stop($('#game-num #user-value1').get(0), data.steps[game.user1]);
			if(data.steps[game.user2]) self.a_stop($('#game-num #user-value2').get(0), data.steps[game.user2]);
			
			// winner
			var msg = '';
			
			for(var i in data.result) {				
				if(game.privilege > 0) {
					if(i == game.user2) msg += 'You - '+data.result[i]+'<br />';
					else msg += i+' - '+data.result[i]+'<br />';
				} else {
					msg += i+' - '+data.result[i]+'<br />';
				}
				if(data.result[i] == 'draw') msg = 'DRAW';
			}
			
			$(document.body).append($(new EJS({url: '/tpl-4.ejs'}).render({msg:'<span style="font-size: 24px;">'+msg+'</span>', author:game.privilege==2?true:false})));
			
		} else {
			
			if(data.steps[game.user1] == 'wait') self.a_wait($('#game-num #user-value1').get(0));
			if(data.steps[game.user2] == 'wait') self.a_wait($('#game-num #user-value2').get(0));
			
		}
		
	}
	
	this.newPart = function(data) {
	
		for(var i in data.account) {
			if(i == game.user1) {
				$('#game-num #user-acc1').html(data.account[i]);
			}
			if(i == game.user2) {
				$('#game-num #user-acc2').html(data.account[i]);
			}
		}
		
		self.a_start($('#game-num #user-value1').get(0));
		self.a_start($('#game-num #user-value2').get(0));
		
		$('#wait').remove();
		
	}
	
}
