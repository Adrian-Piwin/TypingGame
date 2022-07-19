window.addEventListener("load", function(event) {
    /* ==== REFERENCES ====*/ 

    var keyElements = document.getElementsByClassName('key');
    var textPrompt = document.getElementById('textPrompt');

    /* ==== GAME VARIABLES ====*/ 

    var keyList = [
        'q','w','e','r','t','y','u','i','o','p',
        'a','s','d','f','g','h','j','k','l',';',
        'z','x','c','v','b','n','m',',','.','/'
    ]

    var selectedKeyList = []
    var gameRunnning = false;
    var isTyping = false;

    /* ==== VARIABLES ====*/ 

    var startingStr = 'press enter'
    var lostStr = 'you lose'

    var selectKeyInterval = 1000;
    var typePromptInterval = 100;

    /* ==== GET KEY AND VERIFY VALID ====*/ 

    document.onkeydown = function (e) {
        VerifyInput(e.key);
    };

    function VerifyInput(key){
        if (keyList.includes(key) || key == 'Enter')
            KeyPressed(key);
    }

    /* ==== GAME ====*/ 

    // Start game on enter
    // Handle key input when playing game
    function KeyPressed(key){
        if (!gameRunnning && key == 'Enter'){
            isTyping = false;
            gameRunnning = true;
            textPrompt.innerHTML = '';
            ResetKeys();
            Game();
        }
        else if (gameRunnning && key == 'Enter'){
            isTyping = false;
            gameRunnning = false;
            EnterPromptText(startingStr);
            ResetKeys();
        }
        else if (gameRunnning){
            DeselectKey(key);
        }

        PressKey(key);
    }

    // Handle starting game
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
        // Unselect all keys
        for (i = 0; i < keyElements.length; i++){
            keyElements.item(i).classList.remove('selected');
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
        var newKeyList = filterArray(keyList, selectedKeyList);

        // If all keys selected, lose
        if (newKeyList.length == 0){
            Lose();
        }
        
        // Select random key  
        let selKey = newKeyList[Math.floor(Math.random() * newKeyList.length)];

        // Add selected class to key
        selectedKeyList.push(selKey);
        let selKeyElm = FindKeyElem(selKey);
        if (selKeyElm != null)
            selKeyElm.classList.add('selected');
    }

    function DeselectKey(key){
        // Remove key from list
        selectedKeyList = selectedKeyList.filter(e => e !== key);

        // Remove selected class from key
        let keyElm = FindKeyElem(key);
        if (keyElm != null)
            keyElm.classList.remove('selected');
    }

    function PressKey(key){
        // Show effect for pressing key
        let keyElm = FindKeyElem(key);
        if (keyElm != null){
            keyElm.classList.add('pressed');
            setTimeout(function () {
                keyElm.classList.remove('pressed');
            }, 250);
        }
    }

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

    /* ==== UTILITY FUNCTIONS ====*/ 

    // Filter array from another
    const filterArray = (arr1, arr2) => {
        const filtered = arr1.filter(el => {
        return arr2.indexOf(el) === -1;
        });
        return filtered;
    };

    EnterPromptText(startingStr);
});