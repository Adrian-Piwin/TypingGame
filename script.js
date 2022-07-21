window.addEventListener("load", function(event) {
    /* ==== REFERENCES ====*/ 

    var keyElements = document.getElementsByClassName('key');
    var textPrompt = document.getElementById('textPrompt');

    /* ==== GAME VARIABLES ====*/ 

    // ALl keys
    var keyList = [
        'q','w','e','r','t','y','u','i','o','p',
        'a','s','d','f','g','h','j','k','l',';',
        'z','x','c','v','b','n','m',',','.','/'
    ]

    // Section of keys per finger
    var keySectionList = [
        ['q','a','z'],
        ['w','s','x'],
        ['e','d','c'],
        ['r','f','v','t','g','b'],
        ['y','h','n','u','j','m'],
        ['i','k',','],
        ['o','l','.'],
        ['p',';','/']
    ]

    var keyObjList = [];

    var gameRunnning = false;
    var isTyping = false;

    /* ==== VARIABLES ====*/ 

    var startingStr = 'press enter'
    var lostStr = 'you lose'

    var selectKeyInterval = 1000;
    var typePromptInterval = 100;

    /* ==== GET KEY AND VERIFY VALID ====*/ 

    document.onkeydown = function (e) {
        VerifyInput(e.key, true);
    };

    document.onkeyup = function (e) {
        VerifyInput(e.key, false);
    };

    // Verify correct input pressed, and
    // whether its on down or up
    function VerifyInput(key, isDown){
        if (key == 'Enter' && isDown)
            ToggleGame();
        else if (keyList.includes(key) && isDown)
            FindKeyObj(key).OnPressDown();
        else if (keyList.includes(key) && !isDown)
            FindKeyObj(key).OnPressUp();
    }

    /* ==== GAME ====*/ 

    // Handle game start/stop
    function ToggleGame(){
        // Start Game if not running
        if (!gameRunnning){
            isTyping = false;
            gameRunnning = true;
            textPrompt.innerHTML = '';
            ResetKeys();
            Game();
        }
        // End game if running
        else if (gameRunnning){
            isTyping = false;
            gameRunnning = false;
            EnterPromptText(startingStr);
            ResetKeys();
        }
    }

    // Handle game
    function Game(){
        if (gameRunnning == false) return;

        SelectKey();

        setTimeout(function () {
            Game();
        }, selectKeyInterval);
    }
    
    // Handle losing game
    function Lose(){
        EnterPromptText(lostStr);
        gameRunnning = false;
    }

    function ResetKeys(){
        // Unselect selected keys
        for (i = 0; i < keyObjList.length; i++){
            if (keyObjList[i].isSelected)
                keyObjList[i].DeselectKey();
        }

        // Clear list
        selectedKeyList = [];
    }

    /* ==== TEXT FUNCTIONS ====*/ 

    // Enter text letter by letter, with an interval
    function EnterPromptText(text, textIndex=0){
        if (textIndex == 0)
            isTyping = true;
        if (text.length == textIndex) {
            isTyping = false;
            return;
        }
        if (!isTyping){
            textPrompt.innerHTML = '';
            return;
        }

        let newText = textPrompt.innerHTML;
        newText += text[textIndex];
        textPrompt.innerHTML = newText;

        setTimeout(function () {
            EnterPromptText(text, textIndex+1);
        }, typePromptInterval);
    }

    /* ==== KEY FUNCTIONS ====*/ 

    function SelectKey(){
        // Filter already selected keys from key list
        let newKeyList = GetValidKeyList();

        // If all keys selected, lose
        if (newKeyList.length == 0){
            Lose();
            return;
        }
        
        // Select random key  
        let selKey = newKeyList[Math.floor(Math.random() * newKeyList.length)];
        let isHold = Math.floor(Math.random() * 2) == 0 ? true : false;
        FindKeyObj(selKey).SelectKey(isHold);
    }

    // Returns list of valid keys that can be selected
    function GetValidKeyList(){
        let tempList = keyList;
        for (i = 0; i < keyObjList.length; i++){
            if (!keyObjList[i].isSelected) continue;

            for (ind = 0; ind < keySectionList.length; ind++){
                if (keySectionList[ind].includes(keyObjList[i].letter)){
                    tempList = filterArray(tempList, keySectionList[ind])
                }
            }
        }

        return tempList;
    }

    /* ==== UTILITY FUNCTIONS ====*/ 

    // Returns key element from key string
    // Returns null if key not found
    function FindKeyElem(key){
        for (i = 0; i < keyElements.length; i++){
            if (keyElements.item(i).innerHTML == key.toUpperCase()){
                return keyElements[i]
            }
        }

        return null;
    }

    // Return key obj that matches letter
    function FindKeyObj(letter){
        for (i = 0; i < keyObjList.length; i++){
            if (keyObjList[i].letter == letter)
                return keyObjList[i];
        }
        return null;
    }

    // Filter array from another
    const filterArray = (arr1, arr2) => {
        const filtered = arr1.filter(el => {
        return arr2.indexOf(el) === -1;
        });
        return filtered;
    };

    /* ==== SETUP FUNCTIONS ====*/ 

    function SetupKeys(){
        for (i = 0; i < keyList.length; i++){
            keyObjList.push(new Key(keyList[i], FindKeyElem(keyList[i])));
        }
    }

    SetupKeys();
    EnterPromptText(startingStr);
});

/* ==== KEY OBJECT ====*/ 

function Key(letter, element){
    this.letter = letter;
    this.element = element;

    this.isSelected = false;
    this.isHoldType = false;
    this.timeToHoldKey = 0.25;
    this.startTime = 0;
    this.defaultTransition = this.element.style.transition;

    // On key down
    this.OnPressDown = function(){
        this.element.classList.add('pressed');

        // Handle when start of holding key
        if (this.isSelected && this.isHoldType && this.startTime == 0){
            // Start transition for holding key with default value
            this.element.style.transition = this.timeToHoldKey + 's ease-out';
            this.element.classList.remove('selectedHold');

            // Start holding timer
            this.startTime = Date.now();
            this.TimerCheck();
        }
        else if (this.isSelected && !this.isHoldType){
            this.DeselectKey();
        }
    }

    // On key up
    this.OnPressUp = function(){
        this.element.classList.remove('pressed');

        // If selected and hold type, letting go stops process
        if (this.isSelected && this.isHoldType){

            this.element.style.transition = this.defaultTransition;
            this.element.classList.add('selectedHold');

            this.startTime = 0;
        }

    }

    // Select key as normal or hold
    this.SelectKey = function(isHold){
        if (this.isSelected) return;

        // Select key as hold key
        if (isHold){
            this.element.classList.add('selectedHold');
            this.isHoldType = true;
        // Select key
        }else{
            this.element.classList.add('selected');
        }

        this.isSelected = true;
    }

    // Deselect key
    this.DeselectKey = function(){
        this.element.style.transition = this.defaultTransition;
        this.element.classList.remove('selectedHold');
        this.element.classList.remove('selected');

        this.isSelected = false;
        this.isHoldType = false;
        this.startTime = 0;
    }

    // Check on completed timer
    this.TimerCheck = function(){
        var _this = this;
        setTimeout(function () {
            // Hold was interrupted
            if (_this.startTime == 0)
                return;

            // Successfully held key for full time
            if (((Date.now() - _this.startTime) / 1000) >= _this.timeToHoldKey){
                _this.DeselectKey();
                _this.startTime = 0;
            }
            
        }, _this.timeToHoldKey * 1000);
    }
}