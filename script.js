window.addEventListener("load", function(event) {
   
    /* ==== GAME ====*/ 
    var utilityObj = new Utility();
    var textPromptObj = new TextPrompt();
    var gameObj = new Game(utilityObj,textPromptObj);
    gameObj.Game();

    /* ==== GET KEY AND SEND TO GAME ====*/ 
    document.onkeydown = function (e) {
        gameObj.VerifyInput(e.key, true);
    };

    document.onkeyup = function (e) {
        gameObj.VerifyInput(e.key, false);
    };
});

/* ==== GAME OBJECT ====*/ 

function Game(utilityObj, textPromptObj){
    this.utilityObj = utilityObj;
    this.textPromptObj = textPromptObj;

    this.gameRunnning = false;
    this.selectKeyInterval = 1;
    this.selectedKeyList = [];
    this.keyObjList = [];
    this.keyElements = document.getElementsByClassName('key');
    this.intervalID;

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

    // Initilize game
    this.Game = function(){
        this.textPromptObj.EnterPromptText('press enter');

        // Create key objects
        for (i = 0; i < this.keyList.length; i++){
            this.keyObjList.push(new Key(this.keyList[i], 
                this.keyList[i] == ' ' ? this.FindKeyElem('SPACE') : this.FindKeyElem(this.keyList[i]),
                this));
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
        this.textPromptObj.isTyping = false;
        this.textPromptObj.element.innerHTML = '';
        this.gameRunnning = true;

        // Select new key on interval
        this.intervalID = setInterval(() => {
            this.SelectRandomKey();
        }, this.selectKeyInterval * 1000);
    }

    // Stop game loop on loss
    this.LoseGame = function(){
        this.gameRunnning = false;
        this.textPromptObj.EnterPromptText('you lose');
        clearInterval(this.intervalID);
    }

    // Stop game loop on demand
    this.EndGame = function(){
        this.gameRunnning = false;
        this.textPromptObj.EnterPromptText('press enter');
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

/* ==== KEY OBJECT ====*/ 

function Key(letter, element, gameObj){
    this.letter = letter;
    this.element = element;
    this.gameObj = gameObj;
    this.isSelected = false;
    this.timer = 3;
    this.defaultTransition = 0.2;
    this.timerID;

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

function TextPrompt(){
    this.isTyping = false;
    this.typePromptInterval = 100;
    this.element = document.getElementById('textPrompt');

    // Enter text letter by letter, with an interval
    this.EnterPromptText = function(text, textIndex=0){
        if (textIndex == 0)
            this.isTyping = true;
        if (text.length == textIndex) {
            this.isTyping = false;
            return;
        }
        if (!this.isTyping){
            this.element.innerHTML = '';
            return;
        }

        let newText = this.element.innerHTML;
        newText += text[textIndex];
        this.element.innerHTML = newText;

        setTimeout(() => {
            this.EnterPromptText(text, textIndex+1);
        }, this.typePromptInterval);
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
