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
    this.textPromptObj;

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
        this.playerObj = new Player(this);
        this.utilityObj = new Utility();
        this.textPromptObj = new TextPrompt(document.getElementById('textPrompt'));
        this.keyElements = document.getElementsByClassName('key');

        this.textPromptObj.EnterText('press enter');

        // Create key objects
        for (i = 0; i < this.keyList.length; i++){
            this.keyObjList.push(new Key(this,
                this.keyList[i], 
                this.keyList[i] == ' ' ? this.FindKeyElem('SPACE') : this.FindKeyElem(this.keyList[i]),
                this.timeToHitKey));
        }
    }

    // Verify correct input pressed, and
    // whether its on down or up
    this.VerifyInput = function(key, isDown){
        if (key == 'Enter' && isDown)
            this.gameRunnning == false ? this.StartGame() : this.EndGame();
        else if (this.keyList.includes(key) && isDown)
            this.FindKeyObj(key).OnPressDown();
        else if (this.keyList.includes(key) && !isDown)
            this.FindKeyObj(key).OnPressUp();
    }

    // Reset game, start game loop
    this.StartGame = function(){
        this.ResetKeys();
        this.textPromptObj.ClearText();
        this.gameRunnning = true;

        // Select new key on interval
        this.intervalID = setInterval(() => {
            this.SelectRandomKey();
        }, this.selectKeyInterval * 1000);
    }

    // Stop game loop on loss
    this.LoseGame = function(){
        this.gameRunnning = false;
        this.textPromptObj.EnterText('you lose');
        clearInterval(this.intervalID);
    }

    // Stop game loop on demand
    this.EndGame = function(){
        this.gameRunnning = false;
        this.textPromptObj.EnterText('press enter');
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
                    tempList = this.utilityObj.filterArray(tempList, this.keySectionList[ind])
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

function Player(gameObj){
    this.gameObj = gameObj;
    this.score;
    this.hitKeys;
    this.missedKeys;
    this.timeToHitKeyList = [];

    // Player settings

    this.lives = 3;
    this.hitKeyAddScore = 100; // Added score on succesful hit
    this.missedKeyMinusScore = 50; // Subtracted score on miss
    this.timerMultiScore = 3; // Score max multiplier for fastest reaction time

    this.PressedKey = function(timeToHitKey, isHit){
        // Count hit/missed keys
        if (isHit)
            hitKeys++;
        else{
            missedKeys++;
            this.lives--;
            this.lives == 0 ? Game.LoseGame() : null;
        }
        
        // Track how long it takes to hit correct key
        if (isHit)
            this.timeToHitKeyList.push(timeToHitKey);

        this.UpdateScore(timeToHitKey, isHit);
    }

    // Update score according to action
    this.UpdateScore = function(timeToHitKey, isHit){
        if (!isHit){
            this.score -= this.missedKeyMinusScore;
        }else{
            this.score += this.hitKeyAddScore * ((1 (timeToHitKey / gameObj.timeToHitKey)) * this.timerMultiScore);
        }
    }
}

/* ==== KEY OBJECT ====*/ 

function Key(gameObj, letter, element, timeToHitKey){
    this.gameObj = gameObj;
    this.timer = timeToHitKey;
    this.letter = letter;
    this.element = element;
    this.isSelected = false;
    this.timerID;

    // Key settings
    this.defaultTransition = 0.2;

    // On key down
    this.OnPressDown = function(){
        this.element.classList.add('pressed');

        // Check if can deselect key
        if (this.isSelected){
            this.DeselectKey();
        }
    }

    // On key up
    this.OnPressUp = function(){
        this.element.classList.remove('pressed');
    }

    // Select key
    this.SelectKey = function(){
        this.isSelected = true;

        this.element.style.transition = this.timer + 's ease-out';
        this.element.classList.add('selected');
        // Start timer
        this.StartTimer()
    }

    // Deselect key
    this.DeselectKey = function(){
        this.isSelected = false;

        this.element.style.transition = this.defaultTransition + 's ease-out';
        this.element.classList.remove('selected');
        this.element.classList.remove('lossResult');
        // Cancel timer
        clearTimeout(this.timerID)
    }   

    // Start timer after being selected
    // Lose game if key is still selected after timer ends
    this.StartTimer = function(){
        _this = this;
        this.timerID = setTimeout(() => {
            if (this.isSelected && this.gameObj.gameRunnning){
                this.gameObj.LoseGame();
                this.element.classList.add('lossResult');
            }
        }, this.timer * 1000);
    }
}

/* ==== TEXT PROMPT OBJECT ====*/ 

function TextPrompt(element){
    this.element = element;
    this.typingTimeoutIds = [];
    this.typeInterval = 100;
    this.deleteInterval = 50;

    // Start typing if empty, or delete then start typing
    this.EnterText = function(text){
        if (this.element.innerHTML != ""){
            // Stop current typing
            this.ClearTimeouts();
            // Calculate time to delete current text
            let timeToDel = this.element.innerHTML.length * this.deleteInterval;
            // Delete current text
            this.DeleteText();
            // Type new text once delete is finished
            setTimeout(() => {
                this.TypeText(text);
            }, timeToDel+100);
        }
        else{
            this.TypeText(text);
        }
    }

    // Delete text
    this.ClearText = function(){
        // Stop current typing
        this.ClearTimeouts();
        // Delete all
        this.DeleteText();
    }

    // Enter text letter by letter, with an interval
    this.TypeText = function(text, textIndex=0){
        // End of recursion
        if (text.length == textIndex) {
            return;
        }

        // Add new letter from string to element
        let newText = this.element.innerHTML;
        newText += text[textIndex];
        this.element.innerHTML = newText;

        // Recursion
        this.typingTimeoutIds.push(setTimeout(() => {
            this.TypeText(text, textIndex+1, false);
        }, this.typeInterval));
        
    }

    // Delete text letter by letter, with an interval
    this.DeleteText = function(){
        clearTimeout(this.typingTimeoutId);
        let str = this.element.innerHTML;
        if (str.length == 0) return;

        str = str.slice(0, -1);
        this.element.innerHTML = str;

        setTimeout(() => {
            this.DeleteText();
        }, this.deleteInterval);
    }

    // Clear all timeouts
    this.ClearTimeouts = function(){
        for (i = 0; i < this.typingTimeoutIds.length; i++){
            clearTimeout(this.typingTimeoutIds[i]);
        }
        this.typingTimeoutIds = [];
    }
}

/* ==== UTILITY OBJECT ====*/ 

function Utility(){
    // Filter array from another
    this.filterArray = function(arr1, arr2){
        const filtered = arr1.filter(el => {
        return arr2.indexOf(el) === -1;
        });
        return filtered;
    };
}
