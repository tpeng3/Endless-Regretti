
BasicGame.GameOver = function (game) {
	this.music = null;
	this.playButton = null;
};

BasicGame.GameOver.prototype = {
	preload: function() {
		console.log('GameOver: preload');
		this.load.image('rip', 'assets/img/gameover.png');
	},

	create: function() {
		console.log('GameOver: create');
		this.stage.backgroundColor = "#000";

		var rip = this.add.sprite(this.world.centerX, 0, 'rip');
		rip.anchor.setTo(0.5, 0);

        var text = this.add.bitmapText(200, 500, 'btmfont', 'GAME OVER', 24);
        this.add.bitmapText(200, 520, 'btmfont', 'Press ENTER to try again!', 24);
        this.add.bitmapText(200, 550, 'btmfont', 'Press Z to show/hide credits', 24);
	},

	update: function () {
		//	Do some nice funky main menu effect here

		// press ENTER to switch to MainMenu state
		if(this.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
			this.state.start('GamePlay');
		}
	},

    quitGame: function (pointer) {
    //  Here you should destroy anything you no longer need.
    //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

    //  Then let's go back to the main menu.
    //this.state.start('MainMenu');
    }

};
