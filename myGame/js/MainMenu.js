// add the states to Basic Game
var BasicGame = {};

BasicGame.MainMenu = function (game) {
};

BasicGame.MainMenu.prototype = {
	preload: function() {
		console.log('MainMenu: preload');

		this.load.image('instructions', 'assets/img/instructions.png');
		this.load.audio('music', 'assets/audio/tw061.mp3');
		this.load.audio('siren', 'assets/audio/siren.ogg');

		// preload assets
        this.load.atlas('key', 'assets/img/spritesheet.png', 'assets/img/sprites.json');
        this.load.image('block', 'assets/img/block.png');

        this.load.image('sydney', 'assets/img/sydney_sprite.png');
        this.load.image('ravenna', 'assets/img/ravenna_sprite.png');
        this.load.spritesheet('player', 'assets/img/player.png', 64, 64);
        this.load.image('textbox', 'assets/img/textbox.png');
        this.load.text('script', 'js/Script.json');
        this.load.bitmapFont('btmfont', 'assets/img/font.png', 'assets/img/font.fnt');
	},

	create: function() {
		// Load the background
		this.add.sprite(0, 0, 'key', 'instructions');

		this.add.bitmapText(200, 500, 'btmfont', 'Press ENTER to start escaping', 24);

		this.siren = this.add.audio('siren');
		this.siren.play();
        this.game.time.events.loop(500, this.lowerSiren, this);
	},

	update: function () {
		// press ENTER to proceed to the GamePlay state
		if(this.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
			this.state.start('GamePlay');
			this.siren.destroy();
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
