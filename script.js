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
        VerifyInput(e.key, true);
    };

    document.onkeyup = function (e) {
        VerifyInput(e.key, false);
    };

    // Verify correct input pressed, and
    // whether its on down or up
    function VerifyInput(key, isDown){
        if ((keyList.includes(key) || key == 'Enter') && isDown)
            KeyPressed(key);
        else if (keyList.includes(key) && !isDown)
            KeyUnpressed(key);
    }

    /* ==== GAME ====*/ 

    // Start game on enter
    // Handle key input
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

        FindKeyElem(key).classList.add('pressed');
    }

    // Handle key being unpressed
    function KeyUnpressed(key){
        FindKeyElem(key).classList.remove('pressed');
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
        var newKeyList = GetValidKeyList();

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

    // Returns list of valid keys that can be selected
    function GetValidKeyList(){
        let tempList = keyList;
        for (i = 0; i < selectedKeyList.length; i++){
            for (ind = 0; ind < keySectionList.length; ind++){
                if (keySectionList[ind].includes(selectedKeyList[i])){
                    tempList = filterArray(tempList, keySectionList[ind])
                }
            }
        }

        return tempList;
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