function listGames($) {
	
	this.addGame = function(game) {
		$('#game-list > #games').append($(new EJS({url: '/tpl-2.ejs'}).render(game)));
	}
	
	this.removeGame = function(id) {
		$('#game-list > #games #game-'+id).remove();
	}
	
	this.getListGames = function(games) {
		$(document.body).html(new EJS({url: '/tpl-1.ejs'}).render({games: games}));
	}
	
	this.addGamer = function(arg) {
		$('#game-list > #games #game-'+arg.id+' .gamers-game').html(arg.gamers);
		if(arg.maxCount <= arg.gamers) $('#game-list > #games #game-'+arg.id+' input[data-click="game-game"]').attr('disabled','disabled');
	}
	
	this.removeGamer = function(arg) {console.log(arg);
		$('#game-list > #games #game-'+arg.id+' .gamers-game').html(arg.gamers);
		if(arg.maxCount > arg.gamers) $('#game-list > #games #game-'+arg.id+' input[data-click="game-game"]').removeAttr('disabled');
	}
	
	this.addViewer = function(arg) {
		$('#game-list > #games #game-'+arg.id+' .viewers-game').html(arg.viewers);
	}
	
	this.removeViewer = function(arg) {console.log(arg);
		$('#game-list > #games #game-'+arg.id+' .viewers-game').html(arg.viewers);
	}
	
}
