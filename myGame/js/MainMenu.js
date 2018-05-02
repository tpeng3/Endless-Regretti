// add the states to Basic Game
var BasicGame = {};

BasicGame.MainMenu = function (game) {};

BasicGame.MainMenu.prototype = {
	preload: function() {
		// preload sound
		this.load.audio('music', 'assets/audio/tw061.mp3');
		this.load.audio('siren', 'assets/audio/siren.wav');
		this.load.audio('shoot', 'assets/audio/344310__musiclegends__laser-shoot.wav');
		this.load.audio('dead', 'assets/audio/133283__fins__game-over.wav');

		// preload art
		// Please don't dock me points from not putting Everything into the atlas
		// Seriously, some things just look better when I load them normally
        this.load.atlas('key', 'assets/img/spritesheet.png', 'assets/img/sprites.json');
        this.load.image('block', 'assets/img/block.png');
        this.load.image('light', 'assets/img/light.png');
        this.load.image('title', 'assets/img/title.png');
        this.load.image('instructions', 'assets/img/instructions.png');
        this.load.image('sydney', 'assets/img/sydney_sprite.png');
        this.load.image('ravenna', 'assets/img/ravenna_sprite.png');
        this.load.spritesheet('player', 'assets/img/player.png', 64, 64);
        this.load.bitmapFont('btmfont', 'assets/img/font.png', 'assets/img/font.fnt');

        // preload script
        this.load.text('script', 'js/Script.json');
	},

	create: function() {
		// Load the background
		var background = this.add.sprite(0, 0, 'instructions');
		background.alpha = 0;
		this.add.tween(background).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true);

		var title = this.add.sprite(50, 50, 'title');
		title.alpha = 0;
		this.time.events.add(3000, function(){
	        this.add.tween(title).to( { alpha: 1 }, 000, Phaser.Easing.Linear.None, true);
		}, this);

        var start = this.add.bitmapText(90, 210, 'btmfont', 'Press ENTER to start!', 32);
        start.alpha = 0;
        this.time.events.add(4000, function(){
        	this.add.tween(start).to( { alpha: 1 }, 000, Phaser.Easing.Linear.None, true, 0, 1000, true);
        }, this);

		this.siren = this.add.audio('siren');
		this.siren.play();
       	this.siren.fadeOut(5000);
        
	},

	update: function () {
		// press ENTER to proceed to the GamePlay state
		if(this.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
			this.siren.destroy();
			this.state.start('GamePlay');
		}
	}
};
