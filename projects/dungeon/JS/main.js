"use strict";
var app = app || {};
app.main = {
    //properties
    WIDTH: 800
    , HEIGHT: 800
    , canvas: undefined
    , ctx: undefined
    , frameCounter: 0
    , blinkCount: 0
    , paused: false
    , sound: undefined //sound.js
    , Emitter: undefined //emitter.js
    , player: false
    , playerDirection: 0
    , score: 120
    , alive : true
    , health: undefined
    , picks: 5
    , coinEmitter: undefined
    , pLocX: undefined
    , pLocY: undefined
    , locX: undefined
    , loxY: undefined
    , gridSpace: undefined
    , spawnSpace: undefined
    , cells: []
    , overworld: []
    , TILES: Object.freeze({
        BOX_SIZE: 50
    })
    , OVERWORLD_TILES: Object.freeze({
        BG_COLOR: "lightblue"
        , LAND_COLOR: "green"
        , LAND_NUM: 5
        , DUNGEON_NUM: 5
        , SHOP_NUM: 1
    })
    , DUNGEON_TILES: Object.freeze({
        BOX_SIZE: 50
        , BLOCK_NUM: 80
        , GOLD_NUM: 3
        , ENEMY_NUM: 3
    })
    , PLAYER: {
        HEALTH: 3
        , WALK: 1
        , DASH: 2
        , SIZE: 5
    }
    , ENEMY: {
        HEALTH: 3
        , SPEED: 1
        , DMG: 1
    }
    , GAMESTATE: {
        INTRO: 0
        , OVERWORLD: 1
        , DUNGEON: 2
        , PAUSE: 3
        , DEAD: 4
        , SHOP: 5
    }
    , STORE: {
          HEART: 60
        , PICK: 40
    }
    , numBoxes: this.BLOCK_NUM
    , init: function () {
        console.log("app.main.init() called");
        // initialize properties
        this.canvas = document.querySelector('canvas');
        this.canvas.width = this.WIDTH;
        this.canvas.height = this.HEIGHT;
        this.ctx = this.canvas.getContext('2d');
        this.bgAudio = document.querySelector("#bgAudio");
        this.bgAudio.volume = 0.25;
        this.effectAudio = document.querySelector("#effectAudio");
        this.effectAudio.volume = 0.3;
        
        var border = document.querySelector("#border");
        
        var heartMeter = document.querySelector("#heartMeter");
        var pickMeter = document.querySelector("#pickMeter");
        
        //dungeon images
        var stone = document.querySelector("#stone");
        var stoneBG = document.querySelector("#stoneBG");
        var playerUp = document.querySelector("#playerUp");
        var treasure = document.querySelector("#treasure");
        var enemy = document.querySelector('#enemy');
        var ladder = document.querySelector('ladder');
        var coin = document.querySelector('coin');
        
        //overworld images
        var water = document.querySelector("water");
        var redX = document.querySelector("redX");
        var greenCheck = document.querySelector("greenCheck");
        var land = document.querySelector("land");
        var boatUp = document.querySelector("boatUp");
        var boatRight = document.querySelector("boatRight");
        var boatDown = document.querySelector("boatDown");
        var boatLeft = document.querySelector("boatLeft");
        var shop = document.querySelector("shop");
        
        //death screen particles
        this.coinEmitter=new this.Emitter();
        this.coinEmitter.numParticles = 70;
		this.coinEmitter.useCircles = false;
		this.coinEmitter.useSquares = false;
        this.coinEmitter.useImage = true;
		this.coinEmitter.xRange = 421;
		this.coinEmitter.yRange = 11;
		this.coinEmitter.minXspeed = -1;
		this.coinEmitter.maxXspeed = 1;
		this.coinEmitter.minYspeed = -2;
		this.coinEmitter.maxYspeed = -4;
		this.coinEmitter.startRadius = 11;
		this.coinEmitter.expansionRate = 2.3
		this.coinEmitter.decayRate = 1.5;
		this.coinEmitter.lifetime = 500;
        this.coinEmitter.createParticles({x:this.canvas.width * 2,y:this.canvas.height});
        
        this.health = this.PLAYER.HEALTH;
        this.pLocX = this.TILES.BOX_SIZE / 2;
        this.pLocY = this.TILES.BOX_SIZE / 2;
        this.gridSpace = this.canvas.width / this.TILES.BOX_SIZE;
        this.spawnSpace = this.gridSpace - 1;
        for (var i = 0; i < this.gridSpace; i++) {
            this.cells[i] = [];
            this.overworld[i] = [];
        }
        this.GAMESTATE = 0;
        console.log(this.spawnSpace);
        //this.numBoxes = this.TILES.BLOCK_NUM;
        this.generateOverworld(0, 0);
        //this.generateDungeon();
        this.drawTiles();
        this.update();
    }
    , update: function () {
        // schedule a call to update()
        this.animationID = requestAnimationFrame(this.update.bind(this));
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawGUI();
        
        if (this.GAMESTATE == 1, 2) {
            if (this.frameCounter % 50 == 0) {
                this.moveEnemy();
            }
            
            this.frameCounter++;
        } 
        
        if (this.health <= 0) {
            this.die();
        }
        
        //console.log(this.GAMESTATE);
    }
    , generateOverworld: function (playerX, playerY) {
        this.player = false;
        
        //clear cells array
        for (var i = 0; i < this.gridSpace;) {
            for (var j = 0; j < this.gridSpace;) {
                this.cells[i][j] = null;
                //console.log(this.cells[i][j]);
                j++;
            }
            i++;
        }
        //set bounds
        for (var i = 0; i < this.gridSpace; i++) {
            this.cells[0][i] = 99;
            this.cells[i][0] = 99;
            this.cells[this.gridSpace - 1][i] = 99;
            this.cells[i][this.gridSpace - 1] = 99;
        }
        
        //generate islands
        for (var i = 0; i < this.OVERWORLD_TILES.LAND_NUM; i++) {
            var islandSize = Math.floor(getRandom(7, 15));
            this.locX = Math.floor(getRandom(1, this.spawnSpace));
            this.locY = Math.floor(getRandom(1, this.spawnSpace));
            
            this.cells[this.locX][this.locY] = 1;
            
            for(var j = 0; j < islandSize; j++)
            {
                var direction = Math.floor(getRandom(0,4));
                
                switch(direction) {
                    case 0:
                    if(this.cells[this.locX][this.locY - 1] == null){
                        this.cells[this.locX][this.locY -1] = 1;
                        console.log("locX: " + this.locX + " locY: " + this.locY);
                        
                    }
                    break;
                        case 1:
                    if(this.cells[this.locX + 1][this.locY] == null){
                        this.cells[this.locX + 1][this.locY] = 1;
                        console.log("locX: " + this.locX + " locY: " + this.locY);
                       
                    }
                    break;
                        case 2:
                    if(this.cells[this.locX][this.locY + 1] == null){
                        this.cells[this.locX][this.locY + 1] = 1;
                        console.log("locX: " + this.locX + " locY: " + this.locY);
                       
                    }
                    break;
                        case 3:
                    if(this.cells[this.locX - 1][this.locY] == null){
                        this.cells[this.locX - 1][this.locY] = 1;
                        console.log("locX: " + this.locX + " locY: " + this.locY);
                        
                    }
                    break;
                }
            }
            
        }
        
        //assign block tiles
        /*for (var i = 0; i < this.OVERWORLD_TILES.LAND_NUM; i++) {
            this.locX = Math.floor(getRandom(1, this.spawnSpace));
            this.locY = Math.floor(getRandom(1, this.spawnSpace));
            this.cells[this.locX][this.locY] = 1;
        }*/
        
        for (var i = 0; i < this.OVERWORLD_TILES.DUNGEON_NUM; i++) {
            this.locX = Math.floor(getRandom(1, this.spawnSpace));
            this.locY = Math.floor(getRandom(1, this.spawnSpace));
            if (this.cells[this.locX - 1][this.locY] == 1 || this.cells[this.locX + 1][this.locY] == 1 || this.cells[this.locX][this.locY - 1] == 1 || this.cells[this.locX][this.locY + 1] == 1) {
                this.cells[this.locX][this.locY] = 2;
            }
        }
        
        for (var i = 0; i < this.OVERWORLD_TILES.SHOP_NUM; i++) {
            this.locX = Math.floor(getRandom(1, this.spawnSpace));
            this.locY = Math.floor(getRandom(1, this.spawnSpace));
            if (this.cells[this.locX - 1][this.locY] == 1 || this.cells[this.locX + 1][this.locY] == 1 || this.cells[this.locX][this.locY - 1] == 1 || this.cells[this.locX][this.locY + 1] == 1) {
                this.cells[this.locX][this.locY] = 4;
            }
        }
        
        while (this.player == false) {
            this.locX = Math.floor(getRandom(1, this.spawnSpace));
            this.locY = Math.floor(getRandom(1, this.spawnSpace));
            
            if(playerX == this.spawnSpace - 1) {
                this.locX = 1;
                this.locY = playerY;
                this.player = true;
            } else if (playerY == this.spawnSpace - 1) {
                this.locY = 1;
                this.locX = playerX;
                this.player = true;
            } else if(playerX == 1) {
                this.locX = this.spawnSpace - 1;
                this.locY = playerY;
                this.player = true;
            } else if (playerY == 1) {
                this.locY = this.spawnSpace - 1;
                this.locX = playerX;
                this.player = true;
            }
            
            if (this.cells[this.locX][this.locY] == null) {
                this.player = true;
                this.cells[this.locX][this.locY] = 0;
            }
            console.log("player check ran");
        }
        
        for (var i = 0; i < this.gridSpace;) {
            for (var j = 0; j < this.gridSpace;) {
                this.overworld[i][j] = this.cells[i][j];
                //console.log(this.cells[i][j]);
                j++;
            }
            i++;
        }
    }
    , generateDungeon: function () {
        this.player = false;
        //clear cells array
        for (var i = 0; i < this.gridSpace;) {
            for (var j = 0; j < this.gridSpace;) {
                this.cells[i][j] = null;
                //console.log(this.cells[i][j]);
                j++;
            }
            i++;
        }
        //set bounds
        for (var i = 0; i < this.gridSpace; i++) {
            this.cells[0][i] = 99;
            this.cells[i][0] = 99;
            this.cells[this.gridSpace - 1][i] = 99;
            this.cells[i][this.gridSpace - 1] = 99;
        }
        //assign block tiles
        for (var i = 0; i < this.DUNGEON_TILES.BLOCK_NUM; i++) {
            this.locX = Math.floor(getRandom(1, this.spawnSpace));
            this.locY = Math.floor(getRandom(1, this.spawnSpace));
            this.cells[this.locX][this.locY] = 1;
        }
        for (var i = 0; i < this.DUNGEON_TILES.GOLD_NUM; i++) {
            this.locX = Math.floor(getRandom(1, this.spawnSpace));
            this.locY = Math.floor(getRandom(1, this.spawnSpace));
            this.cells[this.locX][this.locY] = 2;
        }
        for (var i = 0; i < this.DUNGEON_TILES.ENEMY_NUM; i++) {
            //var e = {};
            this.locX = Math.floor(getRandom(1, this.spawnSpace));
            this.locY = Math.floor(getRandom(1, this.spawnSpace));
            /*e.locX = this.locX;
                e.locY = this.locY;
            
                e.health = this.ENEMY.HEALTH;*/
            this.cells[this.locX][this.locY] = 3;
        }
        while (this.player == false) {
            this.locX = Math.floor(getRandom(1, this.spawnSpace));
            this.locY = Math.floor(getRandom(1, this.spawnSpace));
            if (this.cells[this.locX][this.locY] == null) {
                this.player = true;
                this.cells[this.locX][this.locY] = 0;
            }
            console.log("player check ran");
        }
        for (var i = 0; i < 1; i++) {
            this.locX = Math.floor(getRandom(1, this.spawnSpace));
            this.locY = Math.floor(getRandom(1, this.spawnSpace));
            this.cells[this.locX][this.locY] = 4;
        }
        for (var i = 0; i < this.spawnSpace;) {
            for (var j = 0; j < this.spawnSpace;) {
                //console.log("Cell " + i + "," + j + " = " + this.cells[i][j]);
                j++;
            }
            i++;
        }
    }
    , drawTiles: function () {
        //this.gridSpace = this.canvas.width / this.TILES.BOX_SIZE;
        //var cellNum = this.gridSpace * this.gridSpace;
        for (var i = 0; i < this.gridSpace;) {
            for (var j = 0; j < this.gridSpace;) {
                if (this.GAMESTATE == 1) {
                    this.ctx.drawImage(water, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                    if (this.cells[i][j] == 99) {
                        this.ctx.drawImage(border, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                        //console.log(i + ',' + j);
                    }
                    else if (this.cells[i][j] == 1) {
                        this.ctx.drawImage(land, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                    }
                    else if (this.cells[i][j] == 2) {
                        this.ctx.drawImage(land, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                        this.ctx.drawImage(redX, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                        // console.log("Gold ran");
                    }  
                    else if (this.cells[i][j] == 4) {
                        this.ctx.drawImage(land, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                        this.ctx.drawImage(shop, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                    }
                    else if (this.cells[i][j] == 5) {
                        this.ctx.drawImage(land, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                        this.ctx.drawImage(greenCheck, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                    }
                    else if (this.cells[i][j] == 0) {
                        this.pLocX = i;
                        this.pLocY = j;
                        //console.log(player);
                        switch (this.playerDirection) {
                        case 0:
                            this.ctx.drawImage(boatUp, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                            break;
                        case 1:
                            this.ctx.drawImage(boatRight, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                            break;
                        case 2:
                            this.ctx.drawImage(boatDown, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                            break;
                        case 3:
                            this.ctx.drawImage(boatLeft, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                            break;
                        }
                    }
                }
                else if (this.GAMESTATE == 2) {
                    this.ctx.drawImage(stoneBG, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                    if (this.cells[i][j] == 99) {
                        this.ctx.drawImage(border, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                        //console.log(i + ',' + j);
                    }
                    else if (this.cells[i][j] == 1) {
                        this.ctx.drawImage(stone, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                        //console.log(i + ',' + j);
                    }
                    else if (this.cells[i][j] == 2) {
                        this.ctx.drawImage(treasure, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                        // console.log("Gold ran");
                    }
                    else if (this.cells[i][j] == 3) {
                        this.ctx.drawImage(enemy, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                        // console.log("Gold ran");
                    }
                    else if (this.cells[i][j] == 4) {
                        this.ctx.drawImage(ladder, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                        // console.log("Gold ran");
                    }
                    else if (this.cells[i][j] == 0) {
                        this.pLocX = i;
                        this.pLocY = j;
                        //console.log(player);
                        switch (this.playerDirection) {
                        case 0:
                            this.ctx.drawImage(playerUp, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                            break;
                        case 1:
                            this.ctx.drawImage(playerRight, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                            break;
                        case 2:
                            this.ctx.drawImage(playerDown, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                            break;
                        case 3:
                            this.ctx.drawImage(playerLeft, i * this.TILES.BOX_SIZE, j * this.TILES.BOX_SIZE, this.TILES.BOX_SIZE, this.TILES.BOX_SIZE);
                            break;
                        }
                    }
                }
                j++;
            }
            i++;
        }
    }
    , movePlayer: function (dir) {
        var moveParameters = [];
        for (var i = 1; i < this.gridSpace;) {
            for (var j = 1; j < this.gridSpace;) {
                if (this.cells[i][j] == 0) {
                    moveParameters = this.canMove(i, j, dir);
                    console.log(moveParameters);
                    this.executeMove(i, j, dir, moveParameters);
                    return;
                }
                j++;
            }
            i++;
        }
    }
    , moveEnemy: function () {
            var moveParameters = [];
            for (var i = 1; i < this.spawnSpace;) {
                for (var j = 1; j < this.spawnSpace;) {
                    var moveDir = Math.floor(getRandom(0, 4));
                    if (this.cells[i][j] == 3) {
                        moveParameters = this.canMove(i, j, moveDir);
                        this.executeMove(i, j, moveDir, moveParameters);
                        break;
                    }
                    j++;
                }
                i++
            }
        }
        //returns a
        
    , canMove: function (i, j, dir) {
        var moveData = [];
        var movingBlock = this.cells[i][j];
        var hitBlock;
        switch (dir) {
        case 0:
            hitBlock = this.cells[i][j - 1];
            break;
        case 1:
            hitBlock = this.cells[i + 1][j];
            break;
        case 2:
            hitBlock = this.cells[i][j + 1];
            break;
        case 3:
            hitBlock = this.cells[i - 1][j];
            break;
        }
        if (this.GAMESTATE == 1) {
            switch (movingBlock) {
            case 0:
                moveData[1] = "player";
                this.pLocX = i;
                this.pLocY = j;
                break;
            case 3:
                moveData[1] = "enemy";
                break;
            }
            switch (hitBlock) {
            case 0:
                moveData[2] = "player";
                break;
            case 1:
                moveData[2] = "land";
                break;
            case 2:
                moveData[2] = "dungeon";
                break;
            case 3:
                moveData[2] = "enemy";
                break;
            case 4:
                moveData[2] = "shop";
                break;
            case 5:
                moveData[2] = "donegeon";
                break;
            case 99:
                moveData[2] = "border";
                break;
            case null:
                moveData[2] = "empty";
            }
            return moveData;
        }
        else if (this.GAMESTATE == 2) {
            switch (movingBlock) {
            case 0:
                moveData[1] = "player";
                break;
            case 3:
                moveData[1] = "enemy";
                break;
            }
            switch (hitBlock) {
            case 0:
                moveData[2] = "player";
                break;
            case 1:
                moveData[2] = "block";
                break;
            case 2:
                moveData[2] = "gold";
                break;
            case 3:
                moveData[2] = "enemy";
                break;
            case 4:
                moveData[2] = "ladder";
                break;
            case 99:
                moveData[2] = "border";
                break;
            case null:
                moveData[2] = "empty";
            }
            return moveData;
        }
    }
    , executeMove: function (i, j, dir, moveData) {
        //console.log(moveData);
        //Player movement rules
        //DUNGEON MOVEMENT
        if (this.GAMESTATE == 2) {
            if (moveData[1] == "player" && moveData[2] == "empty") {
                switch (dir) {
                case 0:
                    this.cells[i][j] = null;
                    this.cells[i][j - 1] = 0;
                    break;
                case 1:
                    this.cells[i][j] = null;
                    this.cells[i + 1][j] = 0;
                    break;
                case 2:
                    this.cells[i][j] = null;
                    this.cells[i][j + 1] = 0;
                    break;
                case 3:
                    this.cells[i][j] = null;
                    this.cells[i - 1][j] = 0;
                    break;
                }
                this.sound.playEffect(0);
            }
            else if (moveData[1] == "player" && moveData[2] == "block") {
                this.sound.playEffect(1);
            }
            else if (moveData[1] == "player" && moveData[2] == "gold") {
                switch (dir) {
                case 0:
                    this.cells[i][j] = null;
                    this.cells[i][j - 1] = 0;
                    break;
                case 1:
                    this.cells[i][j] = null;
                    this.cells[i + 1][j] = 0;
                    break;
                case 2:
                    this.cells[i][j] = null;
                    this.cells[i][j + 1] = 0;
                    break;
                case 3:
                    this.cells[i][j] = null;
                    this.cells[i - 1][j] = 0;
                    break;
                }
                
                var goldAmount = Math.floor(getRandom(5,16));
                
                this.score = this.score + goldAmount;
                this.sound.playEffect(2);
            }
            if (moveData[1] == "enemy" && moveData[2] == "empty") {
                switch (dir) {
                case 0:
                    this.cells[i][j] = null;
                    this.cells[i][j - 1] = 3;
                    break;
                case 1:
                    this.cells[i][j] = null;
                    this.cells[i + 1][j] = 3;
                    break;
                case 2:
                    this.cells[i][j] = null;
                    this.cells[i][j + 1] = 3;
                    break;
                case 3:
                    this.cells[i][j] = null;
                    this.cells[i - 1][j] = 3;
                    break;
                }
            }
            else if (moveData[1] == "enemy" && moveData[2] == "player") {
                this.health--;
            }
            else if (moveData[1] == "player" && moveData[2] == "ladder") {
                this.enterOverworld();
            }
        }
        else if (this.GAMESTATE == 1) {
            if (moveData[1] == "player" && moveData[2] == "empty") {
                switch (dir) {
                case 0:
                    this.cells[i][j] = null;
                    this.cells[i][j - 1] = 0;
                    break;
                case 1:
                    this.cells[i][j] = null;
                    this.cells[i + 1][j] = 0;
                    break;
                case 2:
                    this.cells[i][j] = null;
                    this.cells[i][j + 1] = 0;
                    break;
                case 3:
                    this.cells[i][j] = null;
                    this.cells[i - 1][j] = 0;
                    break;
                }
                this.sound.playEffect(0);
            }
            else if (moveData[1] == "player" && moveData[2] == "land" || moveData[2] == "dungeon") {
                this.sound.playEffect(1);
                console.log("wtf");
            } else if (moveData[1] == "player" && moveData[2] == "border") {
                this.generateOverworld(this.pLocX, this.pLocY);
                console.log("hit border, generate new islands");
            }
            console.log(this.pLocX + "," + this.pLocY);
        }
    }
    , attackBlock: function () {
        console.log("attack ran");
        var attackParameters = [];
        for (var i = 1; i < this.spawnSpace;) {
            for (var j = 1; j < this.spawnSpace;) {
                if (this.cells[i][j] == 0) {
                    switch (this.playerDirection) {
                    case 0:
                        if (this.cells[i][j - 1] == 3) {
                            this.cells[i][j - 1] = null;
                            this.sound.playEffect(3);
                        } else if (this.picks > 0 && this.cells[i][j - 1] == 1) {
                            this.picks--;
                            this.cells[i][j - 1] = null;
                            console.log("pick hit block");
                        }
                        else if (this.cells[i][j - 1] == 0) {
                            this.health--;
                            console.log("unknown damage ran");
                        }
                        else if (this.cells[i][j - 1] == 2 && this.GAMESTATE == 1) {
                            this.overworld[i][j - 1] = 5
                            this.enterDungeon();
                        } else if (this.cells[i][j - 1] == 4 && this.GAMESTATE == 1) {
                            this.enterShop();
                        }
                        break;
                    case 1:
                        if (this.cells[i + 1][j] == 3) {
                            this.cells[i + 1][j] = null;
                            this.sound.playEffect(3);
                        } else if (this.picks > 0 && this.cells[i + 1][j] == 1) {
                            this.picks--;
                            this.cells[i + 1][j] = null;
                            console.log("pick hit block");
                        }
                        else if (this.cells[i + 1][j] == 0) {
                            this.health--;
                            console.log("unknown damage ran");
                        }
                        else if (this.cells[i + 1][j] == 2 && this.GAMESTATE == 1) {
                            this.overworld[i + 1][j] = 5
                            this.enterDungeon();
                        } else if (this.cells[i + 1][j] == 4 && this.GAMESTATE == 1) {
                            this.enterShop();
                        }
                        break;
                    case 2:
                        if (this.cells[i][j + 1] == 3) {
                            this.cells[i][j + 1] = null;
                            this.sound.playEffect(3);
                        } else if (this.picks > 0 && this.cells[i][j + 1] == 1) {
                            this.picks--;
                            this.cells[i][j + 1] = null;
                            console.log("pick hit block");
                        }
                        else if (this.cells[i][j + 1] == 0) {
                            this.health--;
                            console.log("unknown damage ran");
                        }
                        else if (this.cells[i][j + 1] == 2 && this.GAMESTATE == 1) {
                            this.overworld[i][j + 1] = 5
                            this.enterDungeon();
                        } else if (this.cells[i][j + 1] == 4 && this.GAMESTATE == 1) {
                            this.enterShop();
                        }
                        break;
                    case 3:
                        if (this.cells[i - 1][j] == 3) {
                            this.cells[i - 1][j] = null;
                            this.sound.playEffect(3);
                        } else if (this.picks > 0 && this.cells[i - 1][j] == 1) {
                            this.picks--;
                            this.cells[i - 1][j] = null;
                            console.log("pick hit block");
                        }
                        else if (this.cells[i - 1][j] == 0) {
                            this.health--;
                            console.log("unknown damage ran");
                        }
                        else if (this.cells[i - 1][j] == 2 && this.GAMESTATE == 1) {
                            this.overworld[i - 1][j] = 5
                            this.enterDungeon();
                        } else if (this.cells[i - 1][j] == 4 && this.GAMESTATE == 1) {
                            this.enterShop();
                        }
                        break;
                    }
                    return;
                }
                j++;
            }
            i++;
        }
    }
    , enterDungeon: function () {
        this.generateDungeon();
        this.GAMESTATE = 2;
        
        this.sound.playBGAudio(2);
        console.log("enter dungeon");
    }
    , enterShop: function () {
        this.GAMESTATE = 5;
        
        this.sound.playBGAudio(4);
        console.log("enter shop");
    }
    , enterOverworld: function () {
        for (var i = 0; i < this.gridSpace;) {
            for (var j = 0; j < this.gridSpace;) {
                this.cells[i][j] = this.overworld[i][j];
                //console.log(this.cells[i][j]);
                j++;
            }
            i++;
        }
        this.GAMESTATE = 1;
        
        this.sound.playBGAudio(1);
        console.log("leave Dungeon");
    }
    , executeAttack: function (block) {}
    , flipPlayerSprite: function (dir) {
        //console.log(player);
        this.playerDirection = dir;
    }
    , damage: function () {
        this.health--;
    }
    , die: function() {
        this.GAMESTATE = 4;
    }
    , titleScreen: function() {
        var isOn = true;
        
        if (this.blinkCount < 60)
        {
            isOn = true;
        }
        else if(this.blinkCount < 120) 
        {
            isOn = false;
        } else if (this.blinkCount > 120) {
            this.blinkCount = 0;
        }
        
        this.ctx.save();
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "gold";
        
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
        fillText(this.ctx, "Pirate Adventure" , this.canvas.width / 2, this.canvas.height / 2, "50pt serif", "black");
        
        fillText(this.ctx, "Created by Lucas Kern" , this.canvas.width / 2, this.canvas.height - 50, "bold 18pt courier", "black");
        
        if(isOn)
        {
            fillText(this.ctx, "Press Enter to Begin" , this.canvas.width / 2, this.canvas.height / 1.7, "bold 18pt courier", "black");
        }
        
        this.ctx.restore();
        
        this.blinkCount++;
    }
    , gameOver: function() {
        var isOn = true;
        
        if (this.blinkCount < 60)
        {
            isOn = true;
        }
        else if(this.blinkCount < 120) 
        {
            isOn = false;
        } else if (this.blinkCount > 120) {
            this.blinkCount = 0;
        }
        
        this.ctx.save();
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "red";
        
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
        fillText(this.ctx, "Thou Art Dead" , this.canvas.width / 2, this.canvas.height / 2.5, "50pt serif", "black");
        
        fillText(this.ctx, "You amassed a fortune of " + this.score + " pieces of gold!" , this.canvas.width / 2, this.canvas.height / 2, "bold 18pt courier", "black");
        
        if(isOn)
        {
        fillText(this.ctx, "Press Enter to Restart" , this.canvas.width / 2, this.canvas.height / 1.4, "bold 18pt courier", "black");
        }
        this.ctx.restore();
        
        this.blinkCount++;
        
        this.coinEmitter.updateAndDraw(this.ctx,{x:this.canvas.width / 2,y:this.canvas.height}, coin, 20, 20);
    }
    , pauseScreen: function() {
        
        this.ctx.save();
        this.ctx.textAlign = "center";
        this.ctx.fillStyle = "green";
        
        this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
        fillText(this.ctx, "Game Paused" , this.canvas.width / 2, this.canvas.height / 2, "50pt serif", "white");
        
        fillText(this.ctx, "Created by Lucas Kern" , this.canvas.width / 2, this.canvas.height - 50, "bold 18pt courier", "white");
        
        
        this.ctx.restore();
        
    }
    , inGame: function() {
        this.drawTiles();
        
        this.drawStats();
        
    }
    , drawStats: function () {
        fillText(this.ctx, "Gold: " + this.score, 20, 30, "bold 24pt  verdana", "gold");
            //fillText(this.ctx, "Picks: " + this.picks, this.canvas.width / 3, this.canvas.height - 15, "24pt verdana", "#F00");
            //fillText(this.ctx, "Health: " + this.health, this.canvas.width - 200, this.canvas.height - 15, "24pt verdana", "#F00");
        
            //ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
            switch (this.health) {
                case 0:
                    this.ctx.drawImage(heartMeter, 0, 0, 0, 50, this.canvas.width - this.TILES.BOX_SIZE * 5, this.canvas.height - this.TILES.BOX_SIZE, this.TILES.BOX_SIZE * 0, this.TILES.BOX_SIZE);
                    break;
                case 1:
                    this.ctx.drawImage(heartMeter, 0, 0, 50, 50, this.canvas.width - this.TILES.BOX_SIZE * 5, this.canvas.height - this.TILES.BOX_SIZE, this.TILES.BOX_SIZE * 1, this.TILES.BOX_SIZE);
                    break;
                case 2:
                    this.ctx.drawImage(heartMeter, 0, 0, 100, 50, this.canvas.width - this.TILES.BOX_SIZE * 5, this.canvas.height - this.TILES.BOX_SIZE, this.TILES.BOX_SIZE * 2, this.TILES.BOX_SIZE);
                    break;
                case 3:
                    this.ctx.drawImage(heartMeter, 0, 0, 150, 50, this.canvas.width - this.TILES.BOX_SIZE * 5, this.canvas.height - this.TILES.BOX_SIZE, this.TILES.BOX_SIZE * 3, this.TILES.BOX_SIZE);
                    break;
                case 4:
                    this.ctx.drawImage(heartMeter, 0, 0, 200, 50, this.canvas.width - this.TILES.BOX_SIZE * 5, this.canvas.height - this.TILES.BOX_SIZE, this.TILES.BOX_SIZE * 4, this.TILES.BOX_SIZE);
                    break;
                case 5:
                    this.ctx.drawImage(heartMeter, 0, 0, 250, 50, this.canvas.width - this.TILES.BOX_SIZE * 5, this.canvas.height - this.TILES.BOX_SIZE, this.TILES.BOX_SIZE * 5, this.TILES.BOX_SIZE);
                    break;
            }
        
        switch (this.picks) {
                case 0:
                    this.ctx.drawImage(pickMeter, 0, 0, 0, 50, 0, this.canvas.height - this.TILES.BOX_SIZE, this.TILES.BOX_SIZE * 0, this.TILES.BOX_SIZE);
                    break;
                case 1:
                    this.ctx.drawImage(pickMeter, 0, 0, 50, 50, 0, this.canvas.height - this.TILES.BOX_SIZE, this.TILES.BOX_SIZE * 1, this.TILES.BOX_SIZE);
                    break;
                case 2:
                    this.ctx.drawImage(pickMeter, 0, 0, 100, 50, 0, this.canvas.height - this.TILES.BOX_SIZE, this.TILES.BOX_SIZE * 2, this.TILES.BOX_SIZE);
                    break;
                case 3:
                    this.ctx.drawImage(pickMeter, 0, 0, 150, 50, 0, this.canvas.height - this.TILES.BOX_SIZE, this.TILES.BOX_SIZE * 3, this.TILES.BOX_SIZE);
                    break;
                case 4:
                    this.ctx.drawImage(pickMeter, 0, 0, 200, 50, 0, this.canvas.height - this.TILES.BOX_SIZE, this.TILES.BOX_SIZE * 4, this.TILES.BOX_SIZE);
                    break;
                case 5:
                    this.ctx.drawImage(pickMeter, 0, 0, 250, 50, 0, this.canvas.height - this.TILES.BOX_SIZE, this.TILES.BOX_SIZE * 5, this.TILES.BOX_SIZE);
                    break;
            }
    }
    , shopScreen: function() {
        this.ctx.save();
        this.ctx.fillStyle = "tan";
        this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
        this.ctx.restore();
        
        this.ctx.save();
        this.ctx.textAlign = "center";
        fillText(this.ctx, "Ye Olde Shoppe" , this.canvas.width / 2, this.canvas.height / 3, " bold 50pt serif", "black");
        
        this.ctx.textAlign = "left";
        
        fillText(this.ctx, "Press e to exit", this.canvas.width - this.TILES.BOX_SIZE * 4, 30, " bold 20pt sans-serif", "red");
        
        fillText(this.ctx, "Cost: " + this.STORE.PICK + ". Press p", this.canvas.width / 3, this.canvas.height / 1.7, " bold 40pt sans-serif", "black");
        this.ctx.drawImage(pickMeter, 0, 0, 50, 50, 100, this.canvas.height / 2, this.TILES.BOX_SIZE * 2, this.TILES.BOX_SIZE * 2);
        
        fillText(this.ctx, "Cost: " + this.STORE.HEART + ". Press h" , this.canvas.width / 3, this.canvas.height / 1.3, " bold 40pt sans-serif", "black");
        this.ctx.drawImage(heartMeter, 0, 0, 50, 50, 100, this.canvas.height / 1.5, this.TILES.BOX_SIZE * 2, this.TILES.BOX_SIZE * 2);
        
        
        this.ctx.restore();
        
        this.drawStats();
    }
    , buyItem: function (itemName) {
        switch(itemName) {
            case "heart":
                if (this.score >= this.STORE.HEART && this.health <= 5) {
                    this.score = this.score - this.STORE.HEART
                    this.health++;
                } else {
                    //cant buy
                }
                break;
                case "pick":
                if (this.score >= this.STORE.PICK && this.picks <= 5) {
                    this.score = this.score - this.STORE.PICK
                    this.picks++;
                } else {
                    //cant buy
                }
                break;
        }
    }
    , restart: function () {
        this.score = 0;
        this.health = this.PLAYER.HEALTH;
        
        this.generateOverworld(null, null);
        
        this.sound.playBGAudio(1);
        
        this.GAMESTATE = 0;
    }
    , drawGUI: function () {
        switch (this.GAMESTATE) {
            case 0:
                this.titleScreen();
                break;
            case 1:
                this.inGame();
            case 2:
                this.inGame();
                break;
            case 4:
                this.gameOver();
                break;
            case 5:
                this.shopScreen();
                break;
        }
        
        if(this.paused) {
            this.pauseScreen();
        }
    }
    , pauseGame: function () {
        this.sound.stopBGAudio();
        
        this.paused = true;
        
        //stop animation loop
        cancelAnimationFrame(this.animationID);
        
        //update once more to draw pause screen
        this.update();
        
    }
    , resumeGame: function () {
        cancelAnimationFrame(this.animationID);
        
        this.paused = false;
        
        this.update();
        
        switch (this.GAMESTATE) {
            case 0:
                this.sound.playBGAudio(2);
                break;
            case 1:
                this.sound.playBGAudio(1);
                break;
            case 2:
                this.sound.playBGAudio(2);
                break;
            case 5:
                this.sound.playBGAudio(4);
                break;
        }
        
    }
    , calculateDeltaTime: function () {
        var now, fps;
        now = performance.now();
        fps = 1000 / (now - this.lastTime);
        fps = clamp(fps, 12, 60);
        this.lastTime = now;
        return 1 / fps;
    }
    , sprite: function (options) {
        var that = {}
            , frameIndex = 0
            , tickCount = 0
            , ticksPerFrame = options.ticksPerFrame || 0
            , numberOfFrames = options.numberOfFrames || 1;
        that.context = options.context;
        that.width = options.width;
        that.height = options.height;
        that.image = options.image;
        that.update = function () {
            tickCount += 1;
            if (tickCount > ticksPerFrame) {
                tickCount = 0;
                // If the current frame index is in range
                if (frameIndex < numberOfFrames - 1) {
                    // Go to the next frame
                    frameIndex += 1;
                }
                else {
                    frameIndex = 0;
                }
            }
        };
        that.render = function () {
            // Clear the canvas
            that.context.clearRect(0, 0, that.width, that.height);
            // Draw the animation
            that.context.drawImage(that.image, frameIndex * that.width / numberOfFrames, 0, that.width / numberOfFrames, that.height, 0, 0, that.width / numberOfFrames, that.height);
        };
        return that;
    }
};