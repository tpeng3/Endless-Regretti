// add the states to Basic Game
var BasicGame = {};

BasicGame.MainMenu = function (game) {};

BasicGame.MainMenu.prototype = {
	preload: function() {
		// preload sound
		this.load.audio('music', 'assets/audio/tw061.mp3');
		this.load.audio('siren', 'assets/audio/siren.ogg');

		// preload art
        this.load.atlas('key', 'assets/img/spritesheet.png', 'assets/img/sprites.json');
        this.load.image('block', 'assets/img/block.png');
        this.load.spritesheet('player', 'assets/img/player.png', 64, 64);

        this.load.image('sydney', 'assets/img/sydney_sprite.png');
        this.load.image('ravenna', 'assets/img/ravenna_sprite.png');
        this.load.bitmapFont('btmfont', 'assets/img/font.png', 'assets/img/font.fnt');

        // preload script
        this.load.text('script', 'js/Script.json');
	},

	create: function() {
		// Load the background
		var background = this.add.sprite(0, 0, 'key', 'instructions');
		background.alpha = 0;
		this.add.tween(background).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true);

		this.siren = this.add.audio('siren');
		this.siren.play();
        this.game.time.events.loop(500, this.lowerSiren, this);
	},

	update: function () {
		// press ENTER to proceed to the GamePlay state
		if(this.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
			this.siren.destroy();
			this.state.start('GamePlay');
		}
	},

	lowerSiren: function() {
		// decrease the siren's volume per second because it's annoying otherwise
		if(this.siren.volume > 0){
			this.siren.volume -= .1;
		}else{
			this.siren.destroy();
		}
	}

};
