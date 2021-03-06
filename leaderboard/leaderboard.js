PlayersList = new Mongo.Collection('players');
//UserAccounts = new Mongo.Collection('users');

/*
	Database data for insert
	PlayersList.insert({ name : "Bob", score : 0 });
	PlayersList.insert({ name : "Mary", score : 0 });
	PlayersList.insert({ name : "David", score : 0 });
	PlayersList.insert({ name : "Bill", score : 0 });
	PlayersList.insert({ name : "Tim", score : 0 });
	PlayersList.insert({ name : "Warren", score : 0 });
*/

if (Meteor.isClient)
{
	Template.loginButtons.rendered = function(){
    	Accounts._loginButtonsSession.set('dropdownVisible', true);
	};

	Template.leaderboard.helpers({
		"player" : function() { 
			var currentUserId = Meteor.userId();
			return PlayersList.find({}, { sort : {score : -1, name: 1} }) 
		},
		"countPlayers" : function() { 
			var currentUserId = Meteor.userId();
			return PlayersList.find().count() 
		},
		"selectedClass" : function() { 
			var playerId = this._id;
			var selectedPlayer = Session.get("selectedPlayer");
			if (playerId == selectedPlayer)	{ return "selected"; }
		},
		"showSelectedPlayer" : function() {
			var selectedPlayer = Session.get("selectedPlayer");
			return PlayersList.findOne(selectedPlayer)
		}
	});

	Template.leaderboard.events({
		"click .player" : function(){
			var playerId = this._id;
			Session.set('selectedPlayer', playerId);
			var selectedPlayer = Session.get("selectedPlayer");
			console.log(selectedPlayer);
			console.log("You clicked .player element");
		},
		"click .increment" : function () {
			var selectedPlayer = Session.get("selectedPlayer");
			Meteor.call('modifyPlayerScore', selectedPlayer, 5);
			//PlayersList.update(selectedPlayer, { $inc : { score : 5 }  });
		},
		"click .decrement" : function () {
			var selectedPlayer = Session.get("selectedPlayer");
			Meteor.call('modifyPlayerScore', selectedPlayer, -5);
			//PlayersList.update(selectedPlayer, { $inc : { score : -5 }  });
		},
		"click .remove" : function() {
			var selectedPlayer = Session.get("selectedPlayer");
			var choice = confirm("Do you want really to remove the player?");
			Meteor.call('removePlayerData', selectedPlayer, choice);
			//if(choice == true) PlayersList.remove(selectedPlayer);
		}
	});

	Template.addPlayerForm.events({

		"submit form" : function () {
		 	event.preventDefault();

			var playerNameVar = event.target.playerName.value;
			var playerScore = event.target.scoreNumber.value;
			//var currentUserId = Meteor.userId();
			//PlayersList.insert({
			//	name: playerNameVar,
			//	score: parseInt(playerScore),
			//	createdBy: currentUserId
			//});
			event.target.playerName.value = null;
			event.target.scoreNumber.value = null;
			Meteor.call('insertPlayerData', playerNameVar);
		}


	});

	Meteor.subscribe("thePlayers");

}

if (Meteor.isServer)
{
	console.log(PlayersList.find().fetch());
	//the code runs only on the server
	Meteor.publish('thePlayers', function() {
		var currentUserId = this.userId;
		return PlayersList.find({createdBy: currentUserId})
	});

	Meteor.methods({
		
		'insertPlayerData' : function(playerNameVar) {
			var currentUserId = Meteor.userId();
			PlayersList.insert({
				name: playerNameVar,
				score: 10,
				createdBy: currentUserId
			});
		},

		'removePlayerData' : function(selectedPlayer, choice){
			var currentUserId = Meteor.userId();
			if(choice == true) PlayersList.remove({_id: selectedPlayer, createdBy: currentUserId});
		},

		'modifyPlayerScore' : function(selectedPlayer, scoreValue){
			var currentUserId = Meteor.userId();
			PlayersList.update({ _id: selectedPlayer, createdBy: currentUserId }, { $inc : { score : scoreValue}  });
		}
	});

}