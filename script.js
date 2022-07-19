var keyList = [
    'q','w','e','r','t','y','u','i','o','p',
    'a','s','d','f','g','h','j','k','l',';',
    'z','x','c','v','b','n','m',',','.','/'
]

var selectedKeyList = []

var gameRunnning = false;

var keyElements = document.getElementsByClassName('key');


/* ==== GET KEY AND VERIFY VALID ====*/ 
document.onkeydown = function (e) {
    verifyInput(e.key);
};

function verifyInput(key){
    if (keyList.includes(key) || key == 'Enter')
        keyPressed(key);
}

/* ==== GAME ====*/ 

function keyPressed(key){
    if (!gameRunnning && key == 'Enter')
        startGame();
    else{

    }
}

function startGame(){

}

function selectKey(){
    // Get random key
    let selKey = keyList[Math.floor(Math.random() * keyList.length)];

    selectedKeyList.push(selKey);
    let selKeyElm = selectKeyElem(selKey);
    console.log(selKeyElm);
    if (selKeyElm != null)
        selKeyElm.classList.add('selected');
}

function selectKeyElem(key){

    for (i = 0; i < keyElements.length; i++){
        console.log(keyElements.item(i).innerHTML);

        if (keyElements.item(i).innerHTML == key.toUpperCase()){
            return keyElements[i]
        }
    }

    return null;
}

window.addEventListener("load", function(event) {
    selectKey();
  
});