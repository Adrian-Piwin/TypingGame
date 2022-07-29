window.addEventListener("load", function(event) {
   
    /* ==== GAME ====*/ 
    var gameObj = new Game();
    gameObj.Initialize();

    /* ==== GET KEY AND SEND TO GAME ====*/ 
    document.onkeydown = function (e) {
        gameObj.VerifyInput(e.key, true);
    };

    document.onkeyup = function (e) {
        gameObj.VerifyInput(e.key, false);
    };
});

/* ==== GAME OBJECT ====*/ 

function Game(){
    this.playerObj;
    this.utilityObj;
    this.titleObj;

    this.gameRunnning = false;
    this.selectedKeyList = [];
    this.keyObjList = [];
    this.keyElements;
    this.intervalID;

    // Game settings
    this.timeToHitKey = 3;
    this.selectKeyInterval = 1;

    // ALl keys
    this.keyList = [
        'q','w','e','r','t','y','u','i','o','p',
        'a','s','d','f','g','h','j','k','l',';',
        'z','x','c','v','b','n','m',',','.','/',' '
    ]

    // Section of keys per finger
    this.keySectionList = [
        ['q','a','z'],
        ['w','s','x'],
        ['e','d','c'],
        ['r','f','v','t','g','b'],
        ['y','h','n','u','j','m'],
        ['i','k',','],
        ['o','l','.'],
        ['p',';','/'],
        [' ']
    ]

    // Initialize game
    this.Initialize = function(){
        this.utilityObj = new Utility();
        this.titleObj = new TextPrompt(document.getElementById('title'));
        this.subtitleObj = new TextPrompt(document.getElementById('subtitle'));
        this.playerObj = new Player(this, this.utilityObj, this.titleObj, this.subtitleObj);
        this.keyElements = document.getElementsByClassName('key');

        this.titleObj.EnterText('Typing Game');
        this.subtitleObj.EnterText('press enter');

        // Create key objects
        for (i = 0; i < this.keyList.length; i++){
            this.keyObjList.push(new Key(this,
                this.utilityObj,
                this.playerObj,
                this.keyList[i], 
                this.keyList[i] == ' ' ? this.FindKeyElem('SPACE') : this.FindKeyElem(this.keyList[i]),
                this.timeToHitKey));
        }
    }

    // Verify correct input pressed, and
    // whether its on down or up
    this.VerifyInput = function(key, isDown){
        if (key == 'Enter' && isDown)
            this.gameRunnning == false ? this.StartGame() : this.EndGame(false);
        else if (this.keyList.includes(key) && isDown)
            this.FindKeyObj(key).OnPressDown();
        else if (this.keyList.includes(key) && !isDown)
            this.FindKeyObj(key).OnPressUp();
    }

    // Reset game, start game loop
    this.StartGame = function(){
        this.ResetKeys();
        this.gameRunnning = true;
        this.playerObj.GameStarted();

        // Select new key on interval
        this.intervalID = setInterval(() => {
            this.SelectRandomKey();
        }, this.selectKeyInterval * 1000);
    }

    // Stop game loop
    this.EndGame = function(isLoss){
        this.gameRunnning = false;
        this.playerObj.GameEnded();

        if (isLoss)
            this.titleObj.EnterText('Game Over');
        else
            this.titleObj.EnterText('Typing Game');

        this.subtitleObj.EnterText('press enter');

        this.ResetKeys();
        clearInterval(this.intervalID);
    }

    // Reset selected keys
    this.ResetKeys = function(){
        // Unselect selected keys
        for (i = 0; i < this.keyObjList.length; i++){
            if (this.keyObjList[i].isSelected)
                this.keyObjList[i].DeselectKey();
        }

        // Clear list
        this.selectedKeyList = [];
    }

    // Select a random key
    this.SelectRandomKey = function(){
        if (!this.gameRunnning) return;

        // Filter already selected keys from key list
        let newKeyList = this.GetValidKeyList();

        // If all keys selected, don't select 
        if (newKeyList.length == 0){
            return;
        }
        
        // Select random key  
        let selKey = newKeyList[Math.floor(Math.random() * newKeyList.length)];
        this.FindKeyObj(selKey).SelectKey();
    }

    // Returns list of valid keys that can be selected
    this.GetValidKeyList = function(){
        let tempList = this.keyList;
        for (i = 0; i < this.keyObjList.length; i++){
            if (!this.keyObjList[i].isSelected) continue;

            for (ind = 0; ind < this.keySectionList.length; ind++){
                if (this.keySectionList[ind].includes(this.keyObjList[i].letter)){
                    tempList = this.utilityObj.FilterArray(tempList, this.keySectionList[ind])
                    continue;
                }
            }
        }

        return tempList;
    }

    // Return key obj that matches letter
    this.FindKeyObj = function(letter){
        for (i = 0; i < this.keyObjList.length; i++){
            if (this.keyObjList[i].letter == letter)
                return this.keyObjList[i];
        }
        return null;
    }

    // Returns key element that matches letter
    this.FindKeyElem = function(letter){
        for (i = 0; i < this.keyElements.length; i++){
            if (this.keyElements.item(i).innerHTML.toUpperCase() == letter.toUpperCase()){
                return this.keyElements[i]
            }
        }

        return null;
    }
}

/* ==== PLAYER OBJECT ====*/

function Player(gameObj, utilityObj, titleObj, subtitleObj){
    this.gameObj = gameObj;
    this.utilityObj = utilityObj;
    this.titleObj = titleObj;
    this.subtitleObj = subtitleObj;

    this.lives = 0;
    this.score = 0;
    this.hitKeys = 0;
    this.missedKeys = 0;
    this.timeToHitKeyList = [];

    // Player settings

    this.startingLives = 3; // Amount of lives for player
    this.hitKeyAddScore = 100; // Added score on succesful hit
    this.timerMultiScore = 3; // Score max multiplier for fastest reaction time

    // Setup on game startup
    this.GameStarted = function(){
        this.titleObj.EnterText('0');
        this.subtitleObj.EnterText('♥♥♥');
        
        this.lives = this.startingLives;
        this.score = 0;
        this.hitKeys = 0;
        this.missedKeys = 0;
        this.timeToHitKeyList = [];
    }

    // Action on game ended
    this.GameEnded = function(){
    }

    this.KeyAction = function(isHit, timeToHitKey=0){
        if (!this.gameObj.gameRunnning) return;

        // Count hit/missed keys
        if (isHit){
            // Update counter
            this.hitKeys++;
            // Track how long it takes to hit correct key
            this.timeToHitKeyList.push(timeToHitKey);
        }
        else{
            // Update counters
            this.missedKeys++;
            this.lives--;
            
            // Update lifes text
            this.subtitleObj.EnterText(('♥').repeat(this.lives));
            this.utilityObj.PlayAnimation(this.subtitleObj.element, 'shake', '0.3');
            

            this.lives <= 0 ? this.gameObj.EndGame(true) : null;
        }

        this.UpdateScore(isHit, timeToHitKey);
    }

    // Update score according to action
    this.UpdateScore = function(isHit, timeToHitKey=0){
        if (!this.gameObj.gameRunnning) return;

        // Add score if hit correct key
        // Multiply score depending on how fast key was pressed
        if (isHit){
            this.score += Math.floor(this.hitKeyAddScore * ((1 - (timeToHitKey / this.gameObj.timeToHitKey)) * this.timerMultiScore));
        }

        // Update score text
        this.titleObj.EnterText('' + this.score);

        // Animation for adding to score
        this.utilityObj.PlayAnimation(this.titleObj.element, 'scoreAdded', '0.5', 'ease-in-out');
    }
}

/* ==== KEY OBJECT ====*/ 

function Key(gameObj, utilityObj, playerObj, letter, element, timeToHitKey){
    this.gameObj = gameObj;
    this.utilityObj = utilityObj;
    this.playerObj = playerObj;
    this.timeToHitKey = timeToHitKey;
    this.letter = letter;
    this.element = element;
    this.isSelected = false;

    this.timer = 0;
    this.timeoutID;

    // Key settings
    this.defaultTransition = 0.2;

    // On key down
    this.OnPressDown = function(){
        this.element.classList.add('pressed');

        // Check if can deselect key
        if (this.isSelected){
            this.DeselectKey(true);

            // Animation for key hit when selected
            this.utilityObj.PlayAnimation(this.element, 'correctKeyAnim', '0.4', 'ease-in-out');
        }else{
            this.playerObj.KeyAction(false);

            // Animation for key hit when not selected
            this.utilityObj.PlayAnimation(this.element, 'incorrectKeyAnim', '0.4', 'ease-in-out');
        }
    }

    // On key up
    this.OnPressUp = function(){
        this.element.classList.remove('pressed');
    }

    // Select key
    this.SelectKey = function(){
        this.isSelected = true;

        this.element.style.transition = this.timeToHitKey + 's ease-out';
        this.element.classList.add('selected');
        // Start timer
        this.StartTimer()
    }

    // Deselect key
    this.DeselectKey = function(isOnTime){
        this.isSelected = false;

        this.element.style.transition = this.defaultTransition + 's ease-out';
        this.element.classList.remove('selected');
        
        // Cancel timer
        clearTimeout(this.timeoutID)

        if (isOnTime == null)
            return;

        // Communicate with player depending on outcome
        if (isOnTime){
            this.playerObj.KeyAction(true, (Date.now() - this.timer) / 1000);
        }else{
            // Animation for key not getting hit on time
            this.utilityObj.PlayAnimation(this.element, 'incorrectKeyAnim', '0.4', 'ease-in-out');

            this.playerObj.KeyAction(false);
        }
    }   

    // Start timer after being selected
    // Lose game if key is still selected after timer ends
    this.StartTimer = function(){
        _this = this;
        this.timeoutID = setTimeout(() => {
            if (this.isSelected && this.gameObj.gameRunnning){
                this.DeselectKey(false);
            }
        }, this.timeToHitKey * 1000);
        this.timer = Date.now();
    }
}

/* ==== TEXT PROMPT OBJECT ====*/ 

function TextPrompt(element){
    this.element = element;
    this.typingTimeoutIds = [];
    this.typeInterval = 80;

    // Start typing if empty, or delete then start typing
    this.EnterText = function(text){
        // Stop current typing
        this.ClearTimeouts();

        this.TypeText(text, this.element.innerHTML.length >= text.length ? this.element.innerHTML.length : text.length);
    }

    // Enter text letter by letter, with an interval
    // If text is already present, replace
    this.TypeText = function(text, loop, curIndex=0){
        // End of recursion
        if (loop <= 0) return;
 
        // If targetting index that the element does not have, add to it
        // Otherwise, replace at index
        let str = this.element.innerHTML;
        if (curIndex >= str.length){
            str += curIndex >= text.length ? '&#8203' : text[curIndex];
        }else{
            str = setCharAt(str, curIndex, curIndex >= text.length ? '&#8203' : text[curIndex]);
        }

        // Update text
        this.element.innerHTML = str;

        // Update counters
        loop--;
        curIndex++;

        // Recursion
        this.typingTimeoutIds.push(setTimeout(() => {
            this.TypeText(text, loop, curIndex);
        }, this.typeInterval));
    }

    // Clear all timeouts
    this.ClearTimeouts = function(){
        for (i = 0; i < this.typingTimeoutIds.length; i++){
            clearTimeout(this.typingTimeoutIds[i]);
        }
        this.typingTimeoutIds = [];
    }

    // Replace char in string
    function setCharAt(str,index,chr) {
        if(index > str.length-1) return str;
        return str.substring(0,index) + chr + str.substring(index+1);
    }
}

/* ==== UTILITY OBJECT ====*/ 

function Utility(){
    // Filter array from another
    this.FilterArray = function(arr1, arr2){
        const filtered = arr1.filter(el => {
        return arr2.indexOf(el) === -1;
        });
        return filtered;
    };

    // Play animation
    this.PlayAnimation = function(element, animName, time, animSetting=''){
        element.style.animation = '';
        element.offsetWidth;
        element.style.animation = animName + ' ' + ( animSetting == '' ? '' : (animSetting + ' ')) + time + 's';
    }
}
