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

const WORDS_COLLECTION = window.location.search.replace("?", "");

let data_path = '../data/ai';
let num_chars = 0;
let num_words = 0;
let t0 = null;
let mistake_count = 0;
let repeated_mistake_flag = false;


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


        this.ــinit();

    }
    ــinit() {
        this.__mistake_flag = false
        this.__mistake_count = 0;

        let chosen_words = this.__choose_words(word_list, WORDS_COLLECTION);  //from ai.js file
        DOM_typed.innerHTML = null;
        DOM_to_type.innerHTML = chosen_words;
        DOM_to_type.firstChild.className = "blnk"; // blink on startup
        window.scrollTo({ top: 0, behavior: 'smooth' });

        this.__update_keyboard_color()
    }

    __update_keyboard_color() {

        let max_wrong = this.__get_max_percentage_of_wrong_char();

        $$("#keyboard_practice .KeyboardKey text").forEach((v, i) => {

            let precentage = this.__get_char_mistake_percentage(v.textContent);

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

    __get_max_percentage_of_wrong_char() {

        let key_history = [];
        for (var i = 0; i < localStorage.length; i++) {

            let letters = [
                "key_ض", "key_ص", "key_ث", "key_ق", "key_ف",
                "key_غ", "key_ع", "key_ه", "key_خ", "key_ح",
                "key_ج", "key_چ", "key_ش", "key_س", "key_ی",
                "key_ب", "key_ل", "key_ا", "key_ت", "key_ن",
                "key_م", "key_ک", "key_گ", "key_ظ", "key_ط",
                "key_ز", "key_ر", "key_ذ", "key_د", "key_پ",
                "key_و", "key_ئ", "key_ژ"
            ];

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

    __get_char_mistake_percentage(chr) {
        let precentage = -1;

        let wrong_count = getValue("key_" + chr).split("0").length - 1; // number of 1 
        let total_length = getValue("key_" + chr).length;

        if (total_length != 0)
            precentage = wrong_count / total_length;

        return precentage;
    }
    


    __choose_words(words, WORDS_COLLECTION) {

        words = words.split("|");

        if (WORDS_COLLECTION != "ai") {
            words = words.slice((WORDS_COLLECTION - 1) * words.length / 20, (WORDS_COLLECTION) * words.length / 20); // 1 20th of data
        }

        let max_wrong = this.__get_max_percentage_of_wrong_char();

        words = words.map(item => {
            let sum = 0;

            for (let i = 0; i < item.length; i++) {
                if (this.__get_char_mistake_percentage(item[i]) == max_wrong) {
                    sum += this.__get_char_mistake_percentage(item[i]);
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
        
        num_words = parseFloat(words.length) / 5; // as a standard way, words are considered to be 5 chars each
        num_chars = words.length;

        words = words.split("");
        words = words.map(item => {
            if (item == ' ')
                item = '␣&#8203;';
            return '<span>' + item + '</span>';
        });
        
        return words.join("");

    }

    __move_cursor(){
        DOM_to_type.firstChild.className = "";
        DOM_typed.appendChild(DOM_to_type.firstChild);

        if (DOM_typed.lastChild.style.color == COLOR_TYPED_MISTAKE)
            DOM_typed.lastChild.style.color = COLOR_TYPED_ACCEPTED;
    
        if (DOM_to_type.firstChild != null)
            DOM_to_type.firstChild.className = "blnk";

        if(DOM_to_type.innerText.length == 0){ 
            beep('finished');
            this.__update_statistics_line(performance.now());
            this.__update_keyboard_color();
            this.__init_totype_line()
            return
        }
    };

    __insert_key_history(char, value){
        
        let key = "key_" + char
        let char_history = getValue(key);

        saveValue( key,
           char_history.length > CHAR_HISTORY_LENGHTH ? char_history.substring(1) : char_history + value
        );

    };

    __mark_first_char_of_totype_as_wrong(){
        DOM_to_type.firstChild.style.color = COLOR_TYPED_MISTAKE;
    }

    __update_statistics_line(finish_time) {
        let words_per_minute = (num_words / (finish_time - this.start_time) * 60000);

        let final_res = Math.round(words_per_minute * 10) / 10;

        if (final_res > getValue(WORDS_COLLECTION + "_max")) {
            saveValue(WORDS_COLLECTION + "_max", final_res);
        }

        saveValue(WORDS_COLLECTION + "_avg", 
              Math.round((parseFloat(~~getValue(WORDS_COLLECTION + "_avg")) 
            * parseFloat(~~getValue(WORDS_COLLECTION + "_count")) + final_res) 
              / (~~parseFloat(getValue(WORDS_COLLECTION + "_count")) + 1) * 10) / 10);


        saveValue(WORDS_COLLECTION + "_count", parseFloat(~~getValue(WORDS_COLLECTION + "_count")) + 1);

        saveValue(WORDS_COLLECTION + "_last_result", final_res);
        saveValue(WORDS_COLLECTION + "_last_mistake_count", this.__mistake_count);
        saveValue(WORDS_COLLECTION + "_last_mistake_precentage", Math.round(this.__mistake_count / num_chars * 100));

        /////////////////////////////////////

        DOM_result.innerHTML = getValue(WORDS_COLLECTION + "_last_result") || "0";

        DOM_mistakes.innerHTML =
              (getValue(WORDS_COLLECTION + "_last_mistake_count")      || "0") + " بار، "
            + (getValue(WORDS_COLLECTION + "_last_mistake_precentage") || "0") + " درصد";

        DOM_result_best.innerHTML = getValue(WORDS_COLLECTION + "_max") || "0";
    }

    __init_totype_line(){
        this.ــinit();
        this.start_time = performance.now()
    }

    __process_keypress(evt){
        if(DOM_typed.innerText.length == 0){ //we havn't start typing yet.
            this.start_time = null;
        }

        let current_expected_key;
        try {
            current_expected_key = DOM_to_type.innerText[0]
        } catch (e) {
            console.log("FINISHED WORDS>")
        }

        let current_pressed_key = evt.key;
        
        if(current_pressed_key === ' '){
            current_pressed_key = CHAR_SPACE
        }

        if (current_expected_key === current_pressed_key){
            this.__mistake_flag = false;
            beep("correct")

            this.__insert_key_history(current_expected_key, "1") // 1 means correct and 0 mean wrong
            this.__move_cursor()

        }else{
            beep("wrong")
            if(!this.__mistake_flag){
                this.__mark_first_char_of_totype_as_wrong()
                this.__insert_key_history(current_expected_key, "0") // 1 means correct and 0 mean wrong
                this.__mistake_count ++;
            }

            this.__mistake_flag = true;
        }
    }


}

const practice = new Practice();

document.onkeypress = (evt) => practice.__process_keypress(evt);