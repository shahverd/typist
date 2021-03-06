const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

to_type     = $("#to_type");
typed       = $("#typed");
res_div     = $("#res_div");
keyboard    = $("#keyboard_practice");
result      = $("#result");
mistakes    = $("#mistakes");
text_length = $("#text_length");
repeat      = $("#repeat");

//prevent defualt behavior of space key which is scrolling the page
window.addEventListener('keypress', function(e) {
  if(e.keyCode == 32 && e.target == document.body) {
    e.preventDefault();
  }
});

$("#title").onclick = function(e){
    $("#iframe_index").classList.toggle("hidden");
    $("#iframe_overlay").classList.toggle("hidden");
    $("#iframe_index").src = $("#iframe_index").src; // refreshing
    e.preventDefault();
}

$("#iframe_overlay").onclick = function(e){
    $("#iframe_index").classList.add("hidden");
    $("#iframe_overlay").classList.add("hidden");
    e.preventDefault();
}

dataset = window.location.search.replace("?", "");

var data_path = '../data/ai'; 
var num_chars = 0; 
var num_words = 0; 
var t0 = null;
var mistake_count = 0;
var repeated_mistake_flag = false;

document.onkeypress = process_keypress;

new_run();

/////////////////////////////////////////////////////////////////////////////////////
function new_run(){
    mistake_count = 0;
    t0 = null;
    repeated_mistake_flag = false;

    show_latest_results();

    data = getValue("full_text");

    if(!data){
        fetch(data_path)
            .then(response => response.text())
            .then(data => {
                setValue("full_text", data)
                process_data(data, dataset);
            });
    }else{
        process_data(data, dataset);
    }
}

function show_latest_results(){
    $("#result").innerHTML = getValue(dataset + "_last_result") || "0";
    
    $("#mistakes").innerHTML = 
        (getValue(dataset + "_last_mistake_count") || "0") + " بار، " 
        + (getValue(dataset + "_last_mistake_precentage") || "0") + " درصد";

    $("#best").innerHTML = getValue(dataset + "_max") || "0";
}

function setValue(name, value) { 
    window.localStorage.setItem(name, value);
}
function getValue(name) { 
    res = window.localStorage.getItem(name);
    return res? res : "";
}

function beep(st) { 

    url = {
        "correct":  "../sounds/keystroke.mp3",
        "wrong":    "../sounds/error.mp3",
        "finished": "../sounds/ding.mp3"
    }

   new Audio(url[st]).play();  
}

function get_wrong_precentage(chr){
    var precentage = -1;

    wrong_count  = getValue("key_" + chr).split("0").length -1;
    total_length = getValue("key_" + chr).length;

    if(total_length != 0)
        precentage = wrong_count / total_length;

    return precentage;
}

function load_keyboard_color(){

    max_wrong = get_max_wrong();


    keys = $$("#keyboard_practice .KeyboardKey text").forEach((v, i) => {

        precentage = get_wrong_precentage(v.textContent);

        color = "";

        middle_pivot = 0.1; //less than this should go to green
        top_pivot = 0.25 // more than this should be fully red
        max_color_range = 70; // from 0 to 256

        green_power = max_color_range /middle_pivot;
        red_power = max_color_range / (top_pivot - middle_pivot);
            
        if(0    <=  precentage && precentage < middle_pivot){
            color = "rgb( " + (precentage * green_power) + ", " + max_color_range + ", 0)";
            v.style.fill = "white";
        }
        if(middle_pivot <= precentage){
            color = "rgb( " + max_color_range + ", " + (max_color_range - (precentage - middle_pivot) * red_power) + ", 0)";
            v.style.fill = "white";
        }

        v.parentNode.querySelector("rect").style.fill = color;

        if(max_wrong <= precentage){
            v.parentNode.querySelector("rect").style.fill = "red";
            v.style.fill = "white";

            if(v.classList.contains("KeyboardKey-symbol--secondary"))
                v.style.fill = "red";
        }

    });

}

function get_max_wrong(){

    var key_history = [];
    for(var i =0; i < localStorage.length; i++){
        
        letters = [
            "key_ض", "key_ص", "key_ث", "key_ق", "key_ف",
            "key_غ", "key_ع", "key_ه", "key_خ", "key_ح",
            "key_ج", "key_چ", "key_ش", "key_س", "key_ی",
            "key_ب", "key_ل", "key_ا", "key_ت", "key_ن",
            "key_م", "key_ک", "key_گ", "key_ظ", "key_ط",
            "key_ز", "key_ر", "key_ذ", "key_د", "key_پ",
            "key_و", "key_ئ", "key_ژ"
        ];


        if(localStorage.key(i).match(/key_/g) && letters.includes(localStorage.key(i))){
            key_history.push( localStorage.getItem(localStorage.key(i)))
        }
    }

    key_history = key_history.map((item) => {
        wrong_count = item.split("0").length -1;
        total_length = item.length;

        var precentage = -1;

        if(total_length != 0)
            precentage = wrong_count / total_length;

        return precentage;

    });


    max_wrong = key_history.sort().reverse()[0];
    return max_wrong;
}

function process_data(data, dataset){

    data = data.split("|");

    if(dataset != "ai"){
        data = data.slice((dataset-1)*data.length/20, (dataset)*data.length/20); // 1 20th of data
    }

    max_wrong = get_max_wrong();

    data = data.map(item => {
        sum = 0;

        for(i = 0; i< item.length; i++){
            if(get_wrong_precentage(item[i]) == max_wrong){
                sum += get_wrong_precentage(item[i]);
            }
        }

        return {
            "word": item, 
            "grade": sum
        }
    });

    data = data.sort((a, b) => {
        return (Math.random() - 0.5)  + 1 / (1 + a.grade) - 1 / (1 + b.grade);
    })

    //data.reverse();


    data = data.map((item) => {return item.word})

    data = data.slice(0, 25);

    //data = data.sort(() => Math.random() - 0.5)

    data = data.join(" ");

    num_words = parseFloat(data.length)/5;
    num_chars = data.length;

    data = data.split("");
    data = data.map(item => { 
        if(item == ' ')
            return '<span style="color:#E0E0E0">␣&#8203;</span>'; 
        return '<span>' + item + '</span>'; 
    });
    data = data.join("");

    typed.innerHTML = null; 
    to_type.innerHTML = data; 
    to_type.firstChild.className = "blnk"; // blink on startup

    window.scrollTo({ top: 0, behavior: 'smooth' });

    load_keyboard_color();
}


function process_keypress(evt){

    if(t0 == null)
        t0 = performance.now();

    evt = evt || window.event;
        

    if ((evt.key == to_type.innerText[0]) || (evt.key == ' ' && to_type.innerText[0] == '␣')) {

        beep("correct");

        repeated_mistake_flag = false;

        char_history = getValue("key_" + to_type.innerText[0]);
        setValue(
            "key_" + to_type.innerText[0], 
             char_history.length > 20 ? char_history.substring(1) : char_history + "1"
        );

        to_type.firstChild.className = "";
        typed.appendChild(to_type.firstChild);

        if(typed.lastChild.style.color == "red")
            typed.lastChild.style.color = "#3498DB";

        if(to_type.innerText.length == 0){
            t1 = performance.now();

            wpm = (num_words/(t1-t0)*60000);

            final_res = Math.round(wpm* 10) / 10;

            if(final_res > getValue(dataset + "_max")){
                setValue(dataset + "_max", final_res);
            }

            setValue(dataset + "_avg", Math.round((parseFloat(~~getValue(dataset + "_avg")) * parseFloat(~~getValue(dataset+ "_count")) + final_res)/(~~parseFloat(getValue(dataset + "_count")) +1 ) * 10)/10);
            setValue(dataset + "_count", parseFloat(~~getValue(dataset + "_count"))+1);

            setValue(dataset + "_last_result", final_res);
            setValue(dataset + "_last_mistake_count", mistake_count);
            setValue(dataset + "_last_mistake_precentage", Math.round(mistake_count/num_chars * 100));

            result.innerHTML = final_res;
            mistakes.innerHTML = mistake_count + " بار، " + Math.round(mistake_count/num_chars * 100) + " درصد";

            //res_div.querySelector('p').style.opacity = "100%";

            load_keyboard_color();

            window.scroll({
                top: 500,
                behavior: 'smooth'
            });

            beep("finished");
            new_run();
        }

    }else{

        beep("wrong");

        to_type.firstChild.style.color = "red";

        if(!repeated_mistake_flag){
            char_history = getValue("key_" + to_type.innerText[0]);
            setValue(
                "key_" + to_type.innerText[0], 
                char_history.length > 20 ? char_history.substring(1) : char_history + "0"
            );
            mistake_count ++;
            repeated_mistake_flag = true;
        }
    }

    if(to_type.firstChild != null)
        to_type.firstChild.className = "blnk";

};
