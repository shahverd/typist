function setValue(name, value) { 
    window.localStorage.setItem(name, value);
}
function getValue(name) { 
    res = window.localStorage.getItem(name);
    return res? res : "";
}

function beep(correct) { 
    url = "";

    if(correct == "wrong"){
        url = "sound_error.mp3";
    }

    if(correct == "correct"){
        url = "sound_keystroke.ogg";
    }

    if(correct == "finished"){
        url = "sound_ding.mp3";
    }

    var snd = new Audio(url);  
    snd.play(); 
}

to_type = document.getElementById("to_type");
typed = document.getElementById("typed")
res_div = document.getElementById("res_div")
result = document.getElementById("result")
mistakes = document.getElementById("mistakes")
text_length = document.getElementById("text_length")
repeat = document.getElementById("repeat")

//prevent defualt behavior of space key which is scrolling the page
window.addEventListener('keypress', function(e) {
  if(e.keyCode == 32 && e.target == document.body) {
    e.preventDefault();
  }
});

document.getElementById("title").onclick = function(e){
    document.getElementById("iframe_index").classList.toggle("hidd");
    document.getElementById("iframe_overlay").classList.toggle("hidd");
    e.preventDefault();
}

document.getElementById("iframe_overlay").onclick = function(e){
    document.getElementById("iframe_index").classList.add("hidd");
    document.getElementById("iframe_overlay").classList.add("hidd");
    e.preventDefault();
}

function get_wrong_precentage(chr){


    wrong_count = getValue("key_" + chr).split("0").length -1;
    total_length = getValue("key_" + chr).length;

    var precentage = -1;

    if(total_length != 0)
        precentage = wrong_count / total_length;

    return precentage;
}

function load_keyboard_color(){
    keys = document.querySelectorAll("#keyboard_practice .KeyboardKey text").forEach((v, i) => {

        precentage = get_wrong_precentage(v.textContent);

        color = "#444444";

        //if(0    <= precentage && precentage < 0.10)color = "green";
        if(0.10 <= precentage && precentage < 0.15)color = "#CB4335";
        if(0.25 <= precentage)color = "red";

        v.style.fill = color;

        v.style.opacity = (0.1 + (precentage > 0 ? precentage : 0) * 5);
        //v.style.opacity = 0.3;
    });

}

function process_data(data){
    var key_history = [];
    for(var i =0; i < localStorage.length; i++){
        if(localStorage.key(i).match(/key_/g)){
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

    data = data.replace("\n", "");
    data = data.split(" ");
    //data = data.sort(() => Math.random() - 0.5)

    data = data.map(item => {
        sum = 0;

        for(i = 0; i< item.length; i++){
            if(get_wrong_precentage(item[i]) > 0 && get_wrong_precentage(item[i] == max_wrong))
                sum += get_wrong_precentage(item[i]);
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

    data = data.slice(0, 50);

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

    to_type.innerHTML = data; 
    to_type.firstChild.className = "blnk"; // blink on startup

    window.scrollTo({ top: 0, behavior: 'smooth' });
}


var num_chars = 0; 
var num_words = 0; 

base_courses_path = 'data/'; 


hash = window.location.hash.replace("#", "");

document.getElementById("result").innerHTML = getValue(hash + "_last_result") || "0";
document.getElementById("mistakes").innerHTML = 
    (getValue(hash + "_last_mistake_count") || "0") 
    + " بار، " 
    + (getValue(hash + "_last_mistake_precentage") || "0") 
    + " درصد";
document.getElementById("best").innerHTML = getValue(hash + "_max") || "0";

if(!getValue("text_" + base_courses_path + hash)){
    fetch(base_courses_path + hash)
        .then(response => response.text())
        .then(data => {
            setValue("text_" + base_courses_path + hash, data)
            process_data(data);
        });
}else{
    data = getValue("text_" + base_courses_path + hash);
    process_data(data);
}

var t0 = null;
var mistake_count = 0;

var repeated_mistake_flag = false;


document.onkeypress = function(evt) {
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

            if(final_res > getValue(hash + "_max")){
                setValue(hash + "_max", final_res);
            }

            setValue(hash + "_avg", Math.round((parseFloat(~~getValue(hash + "_avg")) * parseFloat(~~getValue(hash+ "_count")) + final_res)/(parseFloat(getValue(hash + "_count")) +1 ) * 10)/10);
            setValue(hash + "_count", parseFloat(~~getValue(hash + "_count"))+1);

            setValue(hash + "_last_result", final_res);
            setValue(hash + "_last_mistake_count", mistake_count);
            setValue(hash + "_last_mistake_precentage", Math.round(mistake_count/num_chars * 100));

            result.innerHTML = final_res;
            mistakes.innerHTML = mistake_count + " بار، " + Math.round(mistake_count/num_chars * 100) + " درصد";

            res_div.querySelector('p').style.opacity = "100%";

            load_keyboard_color();

            window.scroll({
                top: 500,
                behavior: 'smooth'
            });

            beep("finished");
            document.onkeypress =  function(e){
                location.reload();
            };
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



load_keyboard_color();
