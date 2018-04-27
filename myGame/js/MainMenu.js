// add the states to Basic Game
var BasicGame = {};

BasicGame.MainMenu = function (game) {
	this.music = null;
	this.playButton = null;
};

BasicGame.MainMenu.prototype = {
	preload: function() {
		console.log('MainMenu: preload');

		this.load.image('instructions', 'assets/img/instructions.png');
		this.load.audio('music', 'assets/audio/tw061.mp3');
		this.load.audio('siren', 'assets/audio/siren.ogg');

		// preload assets
        // also I need to use an atlas later
        this.load.atlas('key', 'assets/img/tempatlas.png', 'assets/img/tempatlas.json');
        this.load.image('block', 'assets/img/block.png');
        this.load.image('bullet', 'assets/img/temp_bullet.png');
        this.load.image('temp_sky', 'assets/img/temp_sky.png');
        this.load.image('buildings', 'assets/img/buildings.png')

        this.load.image('sydney', 'assets/img/sydney_sprite.png');
        this.load.image('ravennas', 'assets/img/ravenna_sprite.png');
        this.load.spritesheet('ravenna', 'assets/img/ravennasprite.png', 64, 64);
        this.load.spritesheet('baddie', 'assets/img/baddie.png', 32, 32);
        this.load.image('textbox', 'assets/img/textbox.png');
        this.load.text('script', 'js/Script.json');
        this.load.bitmapFont('btmfont', 'assets/img/font.png', 'assets/img/font.fnt');
	},

	create: function() {
		// Load the background
		this.add.sprite(0, 0, 'instructions');

		this.add.bitmapText(200, 500, 'btmfont', 'Press ENTER to start escaping', 24);

		this.siren = this.add.audio('siren');
		this.siren.play();
        this.game.time.events.loop(500, this.lowerSiren, this);
	},

	update: function () {
		// press ENTER to proceed to the GamePlay state
		if(this.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
			this.state.start('GamePlay');
		}
	},

	lowerSiren: function() {
		// decrease the siren's volume per second because it's annoying otherwise
		if(this.siren.volume > 0){
			this.siren.volume -= .1;
		}else{
			this.siren.stop();
		}
	}

};
