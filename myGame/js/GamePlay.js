
BasicGame.GamePlay = function (game) {
    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:

    // this.game;      //  a reference to the currently running game (Phaser.Game)
    // this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    // this.camera;    //  a reference to the game camera (Phaser.Camera)
    // this.cache;     //  the game cache (Phaser.Cache)
    // this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    // this.load;      //  for preloading assets (Phaser.Loader)
    // this.math;      //  lots of useful common math operations (Phaser.Math)
    // this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    // this.stage;     //  the game stage (Phaser.Stage)
    // this.time;      //  the clock (Phaser.Time)
    // this.tweens;    //  the tween manager (Phaser.TweenManager)
    // this.state;     //  the state manager (Phaser.StateManager)
    // this.world;     //  the game world (Phaser.World)
    // this.particles; //  the particle manager (Phaser.Particles)
    // this.physics;   //  the physics manager (Phaser.Physics)
    // this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)

    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.
};

BasicGame.GamePlay.prototype = {
    preload: function() {
        console.log('GamePlay: preload');
        this.time.advancedTiming = true;

        // preload assets
        // right now these are all temp imgs until I get my butt off to draw stuff
        // also I need to use an atlas later
        this.load.atlas('key', 'assets/img/tempatlas.png', 'assets/img/tempatlas.json');
        // this.load.image('sky', 'assets/img/temp_sky.png');
        // this.load.image('ground', 'assets/img/platform.png');
        this.load.image('block', 'assets/img/50block.png');
        // this.load.image('light', 'assets/img/10light.png');
        // this.load.image('star', 'assets/img/star.png');
        // this.load.image('diamond', 'assets/img/diamond.png');
        this.load.spritesheet('baddie', 'assets/img/baddie.png', 32, 32);
        this.load.image('textbox', 'assets/img/textbox.png');
        this.load.text('script', 'js/Script.json');
        this.load.bitmapFont('btmfont', 'assets/img/font.png', 'assets/img/font.fnt');
    },

    create: function () {
        console.log('GamePlay: create');

        // Define movement constants
        this.MAX_SPEED = 300 //500; // pixels/second
        this.ACCELERATION = 700 //1500; // pixels/second/second
        this.DRAG = 400; //600; // pixels/second
        this.GRAVITY = 2600; //2600; // pixels/second/second
        this.JUMP_SPEED = -600; //-700 // pixels/second (negative y is up)
        // Define some other constants
        this.INIT_GROUND = 30; // initial amount of ground blocks to generate
        this.INIT_HEIGHT = 5; // average height of blocks
        this.WALL_VELOCITY = -200 // speed at which the blocks fly at you

        // Start up arcade physics
        this.physics.startSystem(Phaser.Physics.ARCADE);

        // Add bg as tile sprite so it can loop
        this.sky = this.add.tileSprite(0, 0, this.world.width, this.world.height, 'key', 'temp_sky');
        // Add background city landscape

        // Create the platform group
        this.platforms = this.add.group();
        this.platforms.enableBody = true;
        // Add initial ground that'll eventually disappear
        this.ground = true;
        for(var i=0; i < this.INIT_GROUND; i++){
            var platform = this.platforms.create(i*50, this.world.height*.6, 'block');
            platform.scale.y = this.INIT_HEIGHT;
            // This stops it from falling away when you jump on it
            platform.body.immovable = true;
        }

        // Create the player sprite
        this.createPlayer();
        // Start a particle emitter, for a cool fancy effect that I'll save until last to try and implement
        this.createLight();
    
        // Set the initial score
        this.tick = this.game.time.now;
        score = 0;
        scoreText = this.add.text(16, 16, 'score: 0', {fontSize: '24px', fill: "#fff"});

        // load up the textbox and script
        this.script = JSON.parse(this.game.cache.getText('script'));
        this.textbox = this.add.sprite(25, 475, 'textbox');
        this.textbox.alpha = 0; // hide the textbox until relevant
    },

    update: function () {
        // debug information
        this.game.debug.text(this.time.fps || '--', 2, 14, "#00ff00");   

        // check for death (aka if the player falls off the screen)
        if(player.x < 0 || player.y > this.world.height - 50 || this.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
            this.state.start('GameOver');
        }

        // update tileSprite background
        this.sky.tilePosition.x -= 1;
        // If the ground is still there, move it out of the way
        this.updatePlatforms();
        // Collide the player with the this.platforms
        this.hitPlatform = this.physics.arcade.collide(player, this.platforms);
        // Update player movement and animation
        this.updatePlayer();
        // Position sprite as on top (so that it's above the light particles)
        this.world.moveUp(player);

        // Update light emitter particles
        this.updateLight();

        // Update score with each passing time you're still alive
        if(this.game.time.now - this.tick > 50){            
            score += 1;
            scoreText.text = 'Score: ' + score;
            this.tick = this.game.time.now;
        }

        // Start up events
        if(score == 10){
            this.unfoldDialogue(1);
        }

    },
    createPlayer: function(){
        // Right now, it's baddie but we'll change this later
        player = this.add.sprite(300, this.world.height/2, 'baddie');
        // Enable physics on the player
        this.physics.arcade.enable(player);
        player.anchor.set(0.5);
        player.body.immovable = false;
        // Our two animations, walking left and right.
        player.animations.add('left', [0, 1], 10, true);
        player.animations.add('right', [2, 3], 20, true);

        // Set player's min and max movement speed
        player.body.maxVelocity.setTo(this.MAX_SPEED, this.MAX_SPEED * 10);
        // Add drag that slows the player when they're not accelerating
        player.body.drag.setTo(this.DRAG, 0);
        // Add gravity
        player.body.gravity.y = this.GRAVITY;

        // Flag to track if the jump button is pressed
        this.jumping = false;
        // A variable to keep track of when the player is moving
        this.moving = false;

        // Capture certain keys to prevent their default actions in the browser.
        this.input.keyboard.addKeyCapture([
            Phaser.Keyboard.LEFT,
            Phaser.Keyboard.RIGHT,
            Phaser.Keyboard.UP,
            Phaser.Keyboard.DOWN
        ]);
    },

    updatePlayer: function(){
        // This code is referenced from gamemechanicexplorer for coding variable jump height
        if(this.input.keyboard.isDown(Phaser.Keyboard.LEFT)){
            // If LEFT key is down, set player velocity to move left
            player.body.acceleration.x = -this.ACCELERATION;
            player.animations.play('left');
            this.moving = true;
        }else if(this.input.keyboard.isDown(Phaser.Keyboard.RIGHT)){
            // If RIGHT key is down, set player velocity to move right
            player.body.acceleration.x = this.ACCELERATION;
            player.animations.play('right');
            this.moving = true;
        }else{
            // Stand still
            player.body.acceleration.x = 0;
            player.animations.play('right');
            this.moving = false;
        }

        // Allow the player to have 2 jumps if they are touching the ground.
        if(player.body.touching.down){
            this.jumps = 2;
            this.jumping = false;
        }
        // Jump! Keep y velocity constant while jump button is held for up to 150ms
        if(this.jumps > 0 && this.input.keyboard.downDuration(Phaser.Keyboard.UP, 150)){
            player.body.velocity.y = this.JUMP_SPEED;
            this.jumping = true;
        }
        // Reduce number of available jumps if the jump input is released
        if(this.jumping && this.input.keyboard.upDuration(Phaser.Keyboard.UP)){
            this.jumps--;
            this.jumping = false;
        }
    },

    createLight: function(){
        // This code is referenced from phaser.io "firestarter particles"
        this.emitter = this.add.emitter(this.world.centerX, this.world.centerY, 400);
        this.emitter.makeParticles('key', '10light');
        this.emitter.gravity = -50;
        this.emitter.setAlpha(1, 0, 500);
        this.emitter.setScale(0.8, .3, 0.8, .3, 800);
        this.emitter.start(false, 600, 1);
    },

    updateLight: function(){
        // Set a constant flow of light following the player
        this.emitter.emitX = player.x;
        this.emitter.emitY = player.y;
        this.emitter.setXSpeed(100,100);
        this.emitter.setYSpeed(100,100);
        // Calculate position of particles
        if(!this.moving || !this.jumping || !this.hitPlatform){
            this.emitter.setXSpeed(-150,-150);
            this.emitter.setYSpeed(0, 0);
        }
    },

    updatePlatforms: function(){
        // If the initial ground is still there, move it out of the way
        if(this.ground){
            this.platforms.forEach(function(platform){
                platform.body.velocity.x = this.WALL_VELOCITY;
                platform.body.friction.x = 0;
            });
        }
        // Update with incoming platforms, aka city buildings
        if(this.platforms.getChildAt(16).x < 0){
            if (this.ground){
                this.ground = false;
            }
            for(var i=0; i<16; i++){
                this.platforms.remove(this.platforms.getChildAt(0));
            }
            // Add some new incoming platforms
            this.makeBlocks();
        }
    },

    makeBlocks: function(){
        // Randomly generates a block wall
        var heightList = [-2, -1, 0, 0, 1, 2];
        for(var i=0; i<16; i++){
            var wallHeight;
            var prevHeight = this.platforms.getChildAt(this.platforms.length-1).y;
            var prob = Math.random();
            if(prob < .1){
                wallHeight = 0;
            }else if(prob < .4 && prevHeight != 0){
                wallHeight = Math.floor((this.world.height - prevHeight)/50);
            }else{
                wallHeight = this.INIT_HEIGHT + heightList[Math.floor(Math.random() * heightList.length)];
            }
            var platform = this.add.sprite(this.world.width + (i * 50), (this.world.height) - (wallHeight * 50), 'block');
            this.game.physics.arcade.enable(platform);
            platform.body.velocity.x = this.WALL_VELOCITY;
            platform.body.friction.x = 0;
            platform.scale.y = wallHeight;
            platform.body.immovable = true;
            this.platforms.add(platform);
        }
    },

    unfoldDialogue: function(key){
        // listen up, sydney's got some sht to say
        this.textbox.alpha = 1;
        speech = this.script.easy;
        var key = 0;
        var startx = 50;
        var starty = 500;
        var end = 450;
        var text = this.add.bitmapText(startx, starty, 'btmfont', speech[key].dialogue, 24);
        // console.log('hello'.charAt(1));
        // this.DIALOGUE = "poop";
        // for(var i=0; i<speech[key].dialogue.length; i++){
        //     this.time.events.add(Phaser.Timer.SECOND, function(){
        //         var poop = speech[key].dialogue;
        //         var text = this.add.bitmapText(startx, starty, 'btmfont', speech[key].dialogue.charAt(i), 24);
        //         console.log('hello'.charAt(i));
        //         console.log(i);
        //         this.world.bringToTop(text);
        //         startx += 24;
        //     }, this);
        // }   
    }
};