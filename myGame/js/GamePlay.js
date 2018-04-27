
BasicGame.GamePlay = function (game) {};

BasicGame.GamePlay.prototype = {
    preload: function() {
        this.time.advancedTiming = true;
    },

    create: function () {
        // Define player movement constants
        this.MAX_SPEED = 300; //500; // pixels/second
        this.ACCELERATION = 700; //1500; // pixels/second/second
        this.DRAG = 650; //600; // pixels/second
        this.GRAVITY = 2500; //2600; // pixels/second/second
        this.JUMP_SPEED = -650; //-700 // pixels/second (negative y is up)
        // Define platform constants
        this.INIT_GROUND = 30; // initial amount of ground blocks to generate
        this.INIT_HEIGHT = 3; // average height of blocks
        this.WALL_VELOCITY = -250; // initial speed at which the blocks fly at you
        // Define score constants
        this.SCORE_GOAL = 400; // initial score goal
        this.SCORE_TICK = 50; // how often the score updates
        // Define text related constants
        this.DIALOGUE_TICK = 20; // dialogue unfolding speed
        this.TEXTBOX_TIME = 4000; // how long the textbox stays
        // Define bullet constants
        this.BULLET_INTERVAL = 3000; // time between bullets fired
        this.NUM_BULLETS = 3; // initial bullet number
        this.BROAD_SWEEP = 100; // board sweep value for collision checking, for bullets
    
        // Start up arcade physics
        this.physics.startSystem(Phaser.Physics.ARCADE);

        // Add backgrounds (as a tileSprite so it can loop)
        this.sky = this.add.tileSprite(0, 0, this.world.width, this.world.height, 'key', 'sky');
        this.buildings = this.add.tileSprite(0,0,this.world.width, this.world.height, 'key', 'buildings');

        // Create the platforms group
        this.platforms = this.add.group();
        this.platforms.enableBody = true;
        // Add initial ground that'll eventually disappear
        for(var i=0; i < this.INIT_GROUND; i++){
            var platform = this.platforms.create(i*64, this.world.height - (this.world.height*this.INIT_HEIGHT*.10), 'block');
            platform.scale.y = this.INIT_HEIGHT;
            platform.body.immovable = true;
            platform.body.velocity.x = this.WALL_VELOCITY;
            platform.body.friction.x = 0;
        }

        // create the bullets group
        this.bullets = this.add.group();
        this.bullets.enableBody = true;
        this.firing = false;

        // Create the player sprite
        this.createPlayer();
        // Start a particle emitter, for a cool fancy effect
        this.createLight();
        // Position sprite as on top (so that it's above the light particles)
        this.world.moveUp(player);
    
        // Set the initial score
        this.scoreTick = this.game.time.now;
        score = 0;
        this.scoreText = this.add.bitmapText(16, 16, 'btmfont', 'score: 0', 24);

        // Play music
        this.music = this.add.audio('music');
        this.music.play();

        // load the script
        this.script = JSON.parse(this.game.cache.getText('script'));

        this.sydney = this.add.sprite(0, 0, 'sydney');
        this.sydney.visible = false;
        this.ravenna = this.add.sprite(0, 0, 'ravenna');
        this.ravenna.visible = false;
        // place the textbox (but keep it hidden)
        this.textbox = this.add.sprite(25, 475, 'key', 'textbox');
        this.textbox.visible = false;
        // initialize the text
        this.btmText = this.add.bitmapText(200, 500, 'btmfont', "", 24); // 24 is the fontSize
        this.btmText.maxWidth = 800;
        this.game.cache.getBitmapFont('btmfont').font.lineHeight = 30; // change line spacing in a more roundabout way

        this.world.moveUp(this.sydney);
        this.world.moveUp(this.ravenna);
        // Start the first dialogue event
        textKey = Math.round(Math.random()); // start the script from either 0 or 1
        textLine = 0;
        charNum = 0;
        this.textRun = false;
        this.game.time.events.add(1000, function(){this.textbox.visible = true, this.textRun = true}, this);
        this.game.time.events.loop(this.DIALOGUE_TICK, this.unfoldDialogue, this, textKey, textLine, charNum);

        // Fire the bullets
        this.game.time.events.loop(this.BULLET_INTERVAL, this.fireBullets, this, this.NUM_BULLETS);
    },

    update: function () {
        // debug information
        this.game.debug.text(this.time.fps || '--', 2, 14, "#00ff00");   

        // check for if player falls off the buildings
        if(player.y > this.world.height - 50 || this.input.keyboard.isDown(Phaser.Keyboard.ENTER)){
            this.music.stop();
            this.state.start('GameOver');
        }
        // if player gets caught by the popo
        if(player.x < 0){
            this.music.stop();
            this.state.start('GameOver');
        }
        // check for death by bullets
        var bulletsActive = this.bullets.children.length;
        if(bulletsActive != 0 && this.bullets.getChildAt(bulletsActive-1).x < this.world.width){
            var minx = player.x - this.BROAD_SWEEP, maxx = player.x + this.BROAD_SWEEP;
            var miny = player.y - this.BROAD_SWEEP, maxy = player.y + this.BROAD_SWEEP;
            for(var i=0; i<bulletsActive; i++){
                var bullet = this.bullets.getChildAt(i);
                if(bullet.x > minx && bullet.x < maxx){
                    if(bullet.y > miny && bullet.y <maxy){
                        if(this.physics.arcade.collide(player, bullet)){
                            this.music.stop();
                            this.state.start('GameOver');
                        }
                    }
                }
            }
        }

        // update tileSprite backgrounds
        this.sky.tilePosition.x -= .1;
        this.buildings.tilePosition.x -=1;

        // Update with incoming platforms, aka city buildings
        if(this.platforms.getChildAt(15).x < 0){
            for(var i=0; i<15; i++){
                this.platforms.remove(this.platforms.getChildAt(0)); // remove the old ones off screen
            }
            this.makeBlocks();
        }

        // Collide the player with the this.platforms
        this.hitPlatform = this.physics.arcade.collide(player, this.platforms);
        // Update player movement and animation
        this.updatePlayer();
        // Update light emitter particles
        this.updateLight();

        // Update score with each passing time you're still alive
        if(this.game.time.now - this.scoreTick > this.SCORE_TICK){            
            score += 1;
            this.scoreText.text = 'Score: ' + score;
            this.scoreTick = this.game.time.now;
        }

        // Check for dialogue that you can unlock
        //Else check if it's time to play a dialogue
        if(this.textbox.visible == false && score > this.SCORE_GOAL){
            // reverse the order later
            if(score > 400 && textKey < 2){
                textKey = 3;
            }else if(score > 800 && textKey < 4){
                textKey = 5;
            }else{
                textKey = Math.floor(Math.random() * this.script.length - 4) + 4; // to account for scripted dialogues
            }
            this.SCORE_GOAL = Math.floor(this.SCORE_GOAL + (Math.log(20*this.SCORE_GOAL) * 50));
            textLine = 0;
            charNum = 0;
            this.textbox.visible = true;
            this.textRun = true;
            this.function = false;
        }
    },
    createPlayer: function(){
        player = this.add.sprite(300, this.world.height/2, 'player');
        // Enable physics on the player
        this.physics.arcade.enable(player);
        player.body.setSize(28, 44, 18, 17);
        player.anchor.set(0.5);
        player.body.immovable = false;
        // Our two animations, walking left and right.
        player.animations.add('left', [0, 1, 2, 3], 10, true);
        player.animations.add('right', [7, 6, 5, 4], 12, true);

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
            player.animations.stop();
            player.body.velocity.y = this.JUMP_SPEED;
            this.jumping = true;
        }
        // Reduce number of available jumps if the jump input is released
        if(this.jumping && this.input.keyboard.upDuration(Phaser.Keyboard.UP)){
            player.animations.stop();
            this.jumps--;
            this.jumping = false;
        }
    },

    createLight: function(){
        // This code is referenced from phaser.io "firestarter particles"
        this.emitter = this.add.emitter(this.world.centerX, this.world.centerY, 400);
        this.emitter.makeParticles('key', 'light');
        this.emitter.gravity = -50;
        this.emitter.setAlpha(1, 0, 500);
        this.emitter.setScale(0.8, .3, 0.8, .3, 800);
        this.emitter.start(false, 600, 1);
    },

    updateLight: function(){
        // Set a constant flow of light following the player
        this.emitter.emitX = player.x;
        this.emitter.emitY = player.y + 10;
        this.emitter.setXSpeed(100,100);
        this.emitter.setYSpeed(100,100);
        // Calculate position of particles
        if(!this.moving || !this.jumping || !this.hitPlatform){
            this.emitter.setXSpeed(-150,-150);
            this.emitter.setYSpeed(0, 0);
        }
    },

    makeBlocks: function(){
        // Randomly generates a block wall
        var heightList = [-1, -1, 0, 0, 1, 2];
        for(var i=0; i<15; i++){
            var wallHeight;
            var prevHeight = Math.floor((this.world.height -
                                         this.platforms.getChildAt(this.platforms.length-1).y) / 64);
            var prob = Math.random();
            if(prob < .05){
                wallHeight = 0;
            }else if(prob < .4 && prevHeight >= 2){
                wallHeight = prevHeight;
            }else{
                wallHeight = this.INIT_HEIGHT + heightList[Math.floor(Math.random() * heightList.length)];
            }
            var platform = this.add.sprite(this.world.width + (i * 64), (this.world.height) - (wallHeight * 64), 'block');
            this.game.physics.arcade.enable(platform);
            platform.body.velocity.x = this.WALL_VELOCITY;
            platform.body.friction.x = 0;
            platform.scale.y = wallHeight;
            platform.body.immovable = true;
            this.platforms.add(platform);
        }
    },

    unfoldDialogue: function(){
        // variables: textKey, textLine, charNum
        // oh my god there's so many variables im sorry this is such ugly code im kermitting
        if(this.textbox.visible == true && this.textRun == true){
            var line = this.script[textKey][textLine];
            // show dialogue text
            if(line.dialogue[charNum] != undefined){
                this.btmText.text += line.dialogue[charNum];
                charNum++;
            // if there are more lines to read in a conversation
            }else if(this.script[textKey][textLine+1] != undefined){
                this.textRun = false;
                this.time.events.add(this.TEXTBOX_TIME, function(){
                    textLine++;
                    charNum = 0;
                    this.btmText.text = "";  
                    this.textRun = true;
                }, this);
            // else clear textbox and end conversation
            }else{
                this.textRun = true;
                if(this.function == false){
                    this.time.events.add(this.TEXTBOX_TIME, function(){
                        this.textbox.visible = false;
                        this.btmText.text = "";
                        // evaluate the function from the dialogue if there is one
                        if(line.function != undefined){
                            eval(line.function);
                        }
                        this.function = true;
                        this.textRun = false;
                    }, this);
                }
            }
            // show sprites
            this.ravenna.visible = (line.sprite == "ravenna"? true : false);
            this.sydney.visible = (line.sprite == "sydney"? true : false);
        // this is such a janky way to keep sprites hidden I'm sorry
        }else if(this.textbox.visible == false){
            this.ravenna.visible = false;
            this.sydney.visible = false;
        }
    },

    fireBullets: function(){
        // sydney doesn't shoot when she's talking, she's not evil
        if (this.firing == true && this.textbox.visible == false){ 
            // Remove previous bullets
            this.bullets.removeAll();
            for(var i=0; i<this.NUM_BULLETS; i++){
                //Randomly generate some bullets
                var x = Math.floor(Math.random() * 200);
                var y = Math.floor(Math.random() * 400);
                // Check if x,y coordinates will interfere with previous bullets
                for(var j=0; j<this.bullets.children.length; j++){
                    if(Math.abs(x - this.bullets.getChildAt(j).x) > 5 && Math.abs(y - this.bullets.getChildAt(j).y) > 5){
                        x = 0;
                        y = Math.floor(Math.random() * 400);
                    }
                }
                var bullet = this.add.sprite(x - 200, y, 'key', 'bullet');
                this.game.physics.arcade.enable(bullet);
                bullet.body.velocity.x = 500;               
                this.bullets.add(bullet);
            }
        }
    },

    speedupWall: function(){
        for(var i=0; i<this.platforms.children.length; i++){
            this.platforms.getChildAt(i).body.velocity.x -= 50;
        }
        this.WALL_VELOCITY -= 50;
    }
}