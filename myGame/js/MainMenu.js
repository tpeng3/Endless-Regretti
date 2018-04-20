// add the states to Basic Game
var BasicGame = {};

BasicGame.MainMenu = function (game) {
	//this.music = null;
	//this.playButton = null;
};

BasicGame.MainMenu.prototype = {
	preload: function() {
		console.log('MainMenu: preload');
	},

	create: function() {
		// Add a menu screen background and a simple "Press ENTER to start"

		console.log('MainMenu: create');
		this.stage.backgroundColor = "#ccddaa";
		this.add.text(10, 10, " Press ENTER to start the game or switch states.\n It's Game Over if the rabbit falls down the screen\n or get caught by the left side.");
		this.add.text(10, 500, "the baddie sprite is temporary", {fontSize: '16'});
		//this.music = this.add.audio('titleMusic');
		//this.music.play();

		//this.add.sprite(0, 0, 'titlepage');
		console.log(this.score);
	},

	update: function () {
		// press ENTER to proceed to the GamePlay state
		if(this.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
			this.state.start('GamePlay');
		}
	}

};
