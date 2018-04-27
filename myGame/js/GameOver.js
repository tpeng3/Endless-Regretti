
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

		var rip = this.add.sprite(this.world.centerX, 0, 'key', 'gameover');
		rip.anchor.setTo(0.5, 0);
		rip.alpha = 0;
		this.game.add.tween(rip).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true);

        var textA = this.add.bitmapText(this.world.centerX, 450, 'btmfont', 'G A M E  O V E R', 50);
        textA.anchor.setTo(0.5);
        textA.alpha = 0;
		this.game.add.tween(textA).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true);

        var textB = this.add.bitmapText(this.world.centerX, 500, 'btmfont', 'Press ENTER to try again!', 24);
        textB.anchor.setTo(0.5);
        textB.visible = false;
        this.time.events.add(2000, function(){textB.visible = true}, this);

        var textC = this.add.bitmapText(10, 570, 'btmfont', 'Press Z to show/hide credits', 20);
        textC.visible = false;
        this.time.events.add(4000, function(){textC.visible = true}, this);
	},

	update: function () {
		// press ENTER to switch to Gameplay state
		if(this.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
			this.state.start('GamePlay');
		}

		// show/hide credits
		if(this.input.keyboard.isDown(Phaser.Keyboard.Z)){
			//if()
		}
	}
};
