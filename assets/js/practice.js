const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const DOM_to_type       = $("#to_type");
const DOM_typed         = $("#typed");
const DOM_res_div       = $("#res_div");
const DOM_keyboard      = $("#keyboard_practice");
const DOM_result        = $("#result");
const DOM_mistakes      = $("#mistakes");
const DOM_text_length   = $("#text_length");
const DOM_repeat        = $("#repeat");
const DOM_result_best   = $("#best")


const COLOR_TYPED_MISTAKE = "red"
const COLOR_TYPED_CORRECT = "gery"
const COLOR_TYPED_ACCEPTED = "blue"

const COLORED_KEY_FORGROUND = "white"
const COLORED_KEY_MOST_MISTAKES = "red"

const CHAR_SPACE = '␣'

const CHAR_HISTORY_LENGHTH = 20;
const NUMBER_OF_WORDS_PER_PRACTICE = 30

const KEY_MAP = {
    "-": "Minus",
    ".": "Period",
    "«": "KeyL",
    "»": "KeyK",
    "\\": "Backslash",
    "/": "Slash",
    " ": "Space",
    "۰": "Digit0",
    "۱": "Digit1",
    "۲": "Digit2",
    "۳": "Digit3",
    "۴": "Digit4",
    "۵": "Digit5",
    "۶": "Digit6",
    "۷": "Digit7",
    "۸": "Digit8",
    "۹": "Digit9",
    "=": "Equal",
    "ش": "KeyA",
    "ذ": "KeyB",
    "ز": "KeyC",
    "ژ": "KeyC",
    "ی": "KeyD",
    "ث": "KeyE",
    "ب": "KeyF",
    "ل": "KeyG",
    "ا": "KeyH",
    "آ": "KeyH",
    "ه": "KeyI",
    "ت": "KeyJ",
    "ن": "KeyK",
    "م": "KeyL",
    "پ": "KeyM",
    "د": "KeyN",
    "خ": "KeyO",
    "ح": "KeyP",
    "ض": "KeyQ",
    "ق": "KeyR",
    "س": "KeyS",
    "ئ": "KeyS",
    "ف": "KeyT",
    "ع": "KeyU",
    "ر": "KeyV",
    "ص": "KeyW",
    "ط": "KeyX",
    "غ": "KeyY",
    "ظ": "KeyZ",
    "ک": "Semicolon",
    "گ": "Quote",
    "ج": "BracketLeft",
    "چ": "BracketRight",
    "و": "Comma",
}


//prevent defualt behavior of space key which is scrolling the page
window.addEventListener('keypress', function (e) {
    if (e.keyCode == 32 && e.target == document.body) {
        e.preventDefault();
    }
});

$("#lessons_link").onclick = function (e) {
    $("#iframe_index").classList.toggle("hidden");
    $("#iframe_overlay").classList.toggle("hidden");
    $("#iframe_index").src = $("#iframe_index").src; // refreshing
    e.preventDefault();
}

$("#iframe_overlay").onclick = function (e) {
    $("#iframe_index").classList.add("hidden");
    $("#iframe_overlay").classList.add("hidden");
    e.preventDefault();
}

const WORDS_COLLECTION_NAME = window.location.search.replace("?", "");

/////////////////////////////////////////////////////////////////////////////////////

function saveValue(name, value) {
    window.localStorage.setItem(name, value);
}
function getValue(name) {
    res = window.localStorage.getItem(name);
    return res ? res : "";
}

function beep(st) {

    url = {
        "correct": "../assets/sounds/keystroke.mp3",
        "wrong": "../assets/sounds/error.wav",
        "finished": "../assets/sounds/finish.wav"
    }

    new Audio(url[st]).play();
}


class Practice {
    constructor() {

        this.choosenWords = []
        this.mistakeFlag = false
        this.mistakeCount = 0;

        this.init();

    }
    init() {

        let structured_chosen_words = this.chooseWords(WORD_LIST, WORDS_COLLECTION_NAME);  //from ai.js file
        DOM_typed.innerHTML = null;
        DOM_to_type.innerHTML = structured_chosen_words;
        DOM_to_type.firstChild.className = "blnk"; // blink on startup

        window.scrollTo({ top: 0, behavior: 'smooth' });

        this.updateKeyboardColor()
        this.showLastStats()
    }

    updateKeyboardColor() {

        let max_wrong = this.__getMaxPercentageOfWrongChar();

        $$("#keyboard_practice .KeyboardKey text").forEach((v, i) => {

            let precentage = this.__getCharMistakePercentage(v.textContent);

            let background_color = "";
            let forground_color = "";

            let MIDDLE_PIVOT = 0.1; //less than this should go to green
            let TOP_PIVOT = 0.25 // more than this should be fully red
            let MAX_COLOR_RANGE = 126; // from 0 to 256

            let GREEN_POWER = MAX_COLOR_RANGE / MIDDLE_PIVOT;
            let RED_POWER = MAX_COLOR_RANGE / (TOP_PIVOT - MIDDLE_PIVOT);

            if (0 <= precentage && precentage < MIDDLE_PIVOT) {
                background_color = "rgb( " + (precentage * GREEN_POWER) + ", " + MAX_COLOR_RANGE + ", 0)";
                forground_color = COLORED_KEY_FORGROUND;
            }
            if (MIDDLE_PIVOT <= precentage) {
                background_color = "rgb( " + MAX_COLOR_RANGE + ", " + (MAX_COLOR_RANGE - (precentage - MIDDLE_PIVOT) * RED_POWER) + ", 0)";
                forground_color = COLORED_KEY_FORGROUND;
            }

            if (max_wrong <= precentage) {
                background_color = COLORED_KEY_MOST_MISTAKES;
                forground_color = COLORED_KEY_FORGROUND

                if (v.classList.contains("KeyboardKey-symbol--secondary"))
                    forground_color = COLORED_KEY_FORGROUND
            }
            
            v.parentNode.querySelector("rect").style.fill = background_color;
            v.style.fill = forground_color

        });

    }

    __getMaxPercentageOfWrongChar() {

        let key_history = [];
        for (var i = 0; i < localStorage.length; i++) {

            let letters = Object.keys(KEY_MAP).map(i => "key_" + i)

            if (localStorage.key(i).match(/key_/g) && letters.includes(localStorage.key(i))) {
                key_history.push(localStorage.getItem(localStorage.key(i)))
            }
        }

        key_history = key_history.map((item) => {
            let wrong_count = item.split("0").length - 1;
            let total_length = item.length;

            let precentage = -1;

            if (total_length != 0)
                precentage = wrong_count / total_length;

            return precentage;

        });

        let max_wrong = key_history.sort().reverse()[0];
        return max_wrong;
    }

    __getCharMistakePercentage(chr) {
        let precentage = -1;

        let wrong_count = getValue("key_" + chr).split("0").length - 1; // number of 1 
        let total_length = getValue("key_" + chr).length;

        if (total_length != 0)
            precentage = wrong_count / total_length;

        return precentage;
    }
    
    chooseWords(words, WORDS_COLLECTION) {

        words = words.split("|");

        let max_wrong = this.__getMaxPercentageOfWrongChar();

        if (WORDS_COLLECTION != "ai") {
            words = words.slice((WORDS_COLLECTION - 1) * words.length / 20, (WORDS_COLLECTION) * words.length / 20); // 1 20th of data
        }

        words = words.map(item => {
            let sum = 0;

            for (let i = 0; i < item.length; i++) {
                if (this.__getCharMistakePercentage(item[i]) == max_wrong) {
                    sum += this.__getCharMistakePercentage(item[i]);
                }
            }

            return {
                "word": item,
                "grade": sum
            }
        });

        words = words.sort((a, b) => {
            return (Math.random() - 0.5) + 1 / (1 + a.grade) - 1 / (1 + b.grade);
        })

        words = words.map((item) => { return item.word })
        words = words.slice(0, NUMBER_OF_WORDS_PER_PRACTICE);
        words = words.join(" ");
        
        this.choosenWords = words

        words = words.split("");
        words = words.map(item => {
            if (item == ' ')
                item = '␣&#8203;';
            return '<span>' + item + '</span>';
        });
        
        return words.join("");
    }

    moveCursorForward(){
        DOM_to_type.firstChild.className = "";
        DOM_typed.appendChild(DOM_to_type.firstChild);

        if (DOM_typed.lastChild.style.color == COLOR_TYPED_MISTAKE)
            DOM_typed.lastChild.style.color = COLOR_TYPED_ACCEPTED;
    
        if (DOM_to_type.firstChild != null)
            DOM_to_type.firstChild.className = "blnk";

        if(!DOM_to_type.innerText){ 
            beep('finished');
            this.updateStats(performance.now());
            this.updateKeyboardColor();
            this.reinitTotypeLine()
            return
        }
    };

    insertKeyHistory(char, value){
        
        let key = "key_" + char
        let char_history = getValue(key);

        saveValue( key,
           char_history.length > CHAR_HISTORY_LENGHTH ? char_history.substring(1) : char_history + value
        );

    };

    markFirstCharOfTotypeAsWrong(){
        DOM_to_type.firstChild.style.color = COLOR_TYPED_MISTAKE;
    }

    updateStats(finish_time) {

        let num_words = this.choosenWords.length / 5  // As an standard value, each word is considered to be 5 chars
        let num_chars = this.choosenWords.length

        let words_per_minute = (num_words / (finish_time - this.start_time) * 60000);

        let final_res = Math.round(words_per_minute * 10) / 10;

        if (final_res > getValue(WORDS_COLLECTION_NAME + "_max")) {
            saveValue(WORDS_COLLECTION_NAME + "_max", final_res);
        }

        saveValue(WORDS_COLLECTION_NAME + "_avg", 
              Math.round((parseFloat(~~getValue(WORDS_COLLECTION_NAME + "_avg")) 
            * parseFloat(~~getValue(WORDS_COLLECTION_NAME + "_count")) + final_res) 
              / (~~parseFloat(getValue(WORDS_COLLECTION_NAME + "_count")) + 1) * 10) / 10);


        saveValue(WORDS_COLLECTION_NAME + "_count", parseFloat(~~getValue(WORDS_COLLECTION_NAME + "_count")) + 1);
        saveValue(WORDS_COLLECTION_NAME + "_last_result", final_res);
        saveValue(WORDS_COLLECTION_NAME + "_last_mistake_count", this.mistakeCount);
        saveValue(WORDS_COLLECTION_NAME + "_last_mistake_precentage", Math.round(this.mistakeCount / num_chars * 100));

        this.showLastStats();
    }

    showLastStats(){

        DOM_result.innerHTML = getValue(WORDS_COLLECTION_NAME + "_last_result") || "0";

        DOM_mistakes.innerHTML =
              (getValue(WORDS_COLLECTION_NAME + "_last_mistake_count")      || "0") + " بار، "
            + (getValue(WORDS_COLLECTION_NAME + "_last_mistake_precentage") || "0") + " درصد";

        DOM_result_best.innerHTML = getValue(WORDS_COLLECTION_NAME + "_max") || "0";

    }

    reinitTotypeLine(){
        this.mistakeFlag = false
        this.mistakeCount = 0;
        this.start_time = null;
        this.init();
    }

    animateKeyOnKeyboard(pressed_key){

        let key = KEY_MAP[pressed_key]
        let key_elem = $('[data-key="'+key+'"]')
        try {
            key_elem.querySelector('rect').style.filter = "url(#removeshadow)" //defined in SVG keyboard --> html

            setTimeout((e) => {
                key_elem.querySelector('rect').style.filter = "url(#dropshadow)" //defined in SVG keyboard --> html
            }, 50)
        }
        catch (e) {
            //probably english char was typed...
        }

    }

    processKeypress(evt){
        if(!DOM_typed.innerText){ //this is our first letter to type, init timer...
            this.start_time = performance.now();
        }

        let current_expected_key;
        try {
            current_expected_key = DOM_to_type.innerText[0]
        } catch (e) {
            console.log("FINISHED WORDS>")
        }

        let current_pressed_key = evt.key;

        this.animateKeyOnKeyboard(current_pressed_key);
        
        if(current_pressed_key === ' '){
            current_pressed_key = CHAR_SPACE
        }

        if (current_expected_key === current_pressed_key){
            this.mistakeFlag = false;
            beep("correct")

            this.insertKeyHistory(current_expected_key, "1") // 1 means correct and 0 mean wrong
            this.moveCursorForward()

        }else{
            beep("wrong")
            if(!this.mistakeFlag){
                this.markFirstCharOfTotypeAsWrong()
                this.insertKeyHistory(current_expected_key, "0") // 1 means correct and 0 mean wrong
                this.mistakeCount ++;
            }

            this.mistakeFlag = true;
        }
    }

}

const practice = new Practice();

document.onkeypress = (evt) => practice.processKeypress(evt);