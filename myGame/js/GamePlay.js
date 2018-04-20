
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
        this.load.text('dialogue', 'js/Script.json');
        this.load.bitmapFont('btmfont', 'assets/img/font.png', 'assets/img/font.fnt');
    },

    create: function () {
        console.log('GamePlay: create');

        // Start up arcade physics
        this.physics.startSystem(Phaser.Physics.ARCADE);

        // Add bg as tile sprite so it can loop
        this.sky = this.add.tileSprite(0, 0, this.world.width, this.world.height, 'key', 'temp_sky');
        // Add background city landscape

        // Create the platform group
        this.platforms = this.add.group();
        // We will enable physics for any object that is created in this group
        this.platforms.enableBody = true;

        // Add initial ground that'll eventually disappear
        this.ground = true;
        for(var i=0; i < 30; i++){
            var platform = this.platforms.create(i*50, this.world.height*.6, 'block');
            platform.scale.y = 6;
            // This stops it from falling away when you jump on it
            platform.body.immovable = true;
        }

        // Define movement constants
        // This code is referenced from gamemechanicexplorer for coding variable jump height
        this.MAX_SPEED = 300 //500; // pixels/second
        this.ACCELERATION = 700 //1500; // pixels/second/second
        this.DRAG = 600; //600; // pixels/second
        this.GRAVITY = 2600; //2600; // pixels/second/second
        this.JUMP_SPEED = -500; //-700 // pixels/second (negative y is up)

        // Create the player sprite
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

        // Capture certain keys to prevent their default actions in the browser.
        this.input.keyboard.addKeyCapture([
            Phaser.Keyboard.LEFT,
            Phaser.Keyboard.RIGHT,
            Phaser.Keyboard.UP,
            Phaser.Keyboard.DOWN
        ]);

        // A variable to keep track of when the player is moving
        this.moving = false;

        // Start a particle emitter
        // This code is referenced from phaser.io "firestarter particles"
        this.emitter = this.add.emitter(this.world.centerX, this.world.centerY, 400);
        this.emitter.makeParticles('key', '10light');
        // this.emitter.body.setCircle(this.emitter.width * 0.3);
        this.emitter.gravity = 200;
        this.emitter.setAlpha(1, 0, 300);
        this.emitter.setScale(0.8, 0, 0.8, 0, 1000);
        this.emitter.start(false, 500, 1);
    
        // Set the initial score
        this.tick = this.game.time.now;
        score = 0;
        scoreText = this.add.text(16, 16, 'score: 0', {fontSize: '24px', fill: "#fff"});

        // load up the dialogue
        this.dialogue = JSON.parse(this.game.cache.getText('dialogue'));
        console.log(this.dialogue);
        this.textbox = this.add.sprite(25, 450, 'textbox');

    },

    update: function () {
        // debug information
        this.game.debug.text(this.time.fps || '--', 2, 14, "#00ff00");   

        // update tileSprite background
        this.sky.tilePosition.x -= 1;

        // press ENTER to switch to MainMenu state
        // later on, change this to when the player collides with an enemy and dies
        if(this.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
            this.state.start('GameOver');
        }
        // If player falls off the platform or gets caught by the popo
        if(player.x < 0 || player.y > this.world.height - 50){
            console.log(player.y);
            this.state.start('GameOver');
        }

        // If the ground is still there, move it out of the way
        if(this.ground){
            this.platforms.forEach(function(platform){
                platform.body.velocity.x = -200;
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
            this.makeBlocks();
        }

        // Position sprite as on top
        this.world.moveUp(player);

        // Collide the player with the this.platforms
        var hitPlatform = this.physics.arcade.collide(player, this.platforms);

        // Update player movement and animation
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

        // Update light emitter particles
        // I need to figure out how to change the direction they're placed...
        var px = player.body.velocity.x;
        var py = player.body.velocity.y;
        if(px < 0){
            this.emitter.minParticleSpeed.set(-1*(px+100), -1*(py+100));
            this.emitter.maxParticleSpeed.set(-1*(px+100), -1*(py+100));
        }else{
            this.emitter.minParticleSpeed.set(-1*(px-300), -1*(py));
            this.emitter.maxParticleSpeed.set(-1*(px-300), -1*(py));
        }

        // Calculate position of particles
        if(this.moving || this.jumping || !hitPlatform){
            this.emitter.emitX = player.x;
            this.emitter.emitY = player.y;
        }else{
            this.emitter.emitX = player.x;
            this.emitter.emitY = player.y
        }

        // Update score with each passing time you're still alive
        if(this.game.time.now - this.tick > 50){            
            score += 1;
            scoreText.text = 'Score: ' + score;
            this.tick = this.game.time.now;
        }

        if(score == 10){
            this.time.events.add(Phaser.Timer.SECOND, function(){console.log("wawaaw, this")});
            this.unfoldDialogue(1);
        }

    },

    makeBlocks: function(){
        // Randomly generates a block wall
        var heightList = [0, 0, 0, 2, 3, 4, 5, 6, 6, 7, 8, 6, 5, 3]
        for(var i=0; i<16; i++){
            var wallHeight = heightList[Math.floor(Math.random() * heightList.length)];
            var platform = this.add.sprite(this.world.width + (i * 50), (this.world.height) - (wallHeight * 50), 'block');
            this.game.physics.arcade.enable(platform);
            platform.body.velocity.x = -200;
            platform.body.friction.x = 0;
            platform.scale.y = wallHeight;
            // This stops it from falling away when you jump on it
            platform.body.immovable = true;
            this.platforms.add(platform);
        }
    },

    unfoldDialogue: function(key){
        // listen up, sydney's got some sht to say
        this.textbox.alpha = 1;
        speech = this.dialogue.easy;
        var key = 0;
        var startx = 50;
        var starty = 500;
        var end = 450;
        var text = this.add.bitmapText(startx, starty, 'btmfont', speech[key].dialogue, 24);
        console.log('hello'.charAt(1));
        for(var i=0; i<speech[key].dialogue.length; i++){
            this.time.events.add(Phaser.Timer.SECOND, function(){
                var poop = speech[key].dialogue;
                var text = this.add.bitmapText(startx, starty, 'btmfont', speech[key].dialogue.charAt(i), 24);
                console.log('hello'.charAt(i));
                console.log(i);
                this.world.bringToTop(text);
                startx += 24;
            }, this);
        }   
    }
};