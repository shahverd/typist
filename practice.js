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
        url = "sound_keystroke.mp3";
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

        color = "grey";

        if(0    <= precentage && precentage < 0.10)color = "green";
        if(0.10 <= precentage && precentage < 0.15)color = "orange";
        if(0.25 <= precentage)color = "red";

        v.style.fill = color;
    });

}


var num_chars = 0; 
var num_words = 0; 

base_courses_path = 'data/'; 


hash = window.location.hash.replace("#", "");

document.getElementById("num").innerHTML = getValue(hash + "_count");
document.getElementById("doc_date").innerHTML = new Date().toLocaleDateString('fa-IR');
document.getElementById("appendix").innerHTML = "بهترین:" + getValue(hash + "_max");

fetch(base_courses_path + hash)
    .then(response => response.text())
    .then(data => {

        data = data.split(" ");
        //data = data.sort(() => Math.random() - 0.5)

        data = data.map(item => {
            sum = 0;

            for(i = 0; i< item.length; i++){
                if(get_wrong_precentage(item[i]) > 0)
                    sum += get_wrong_precentage(item[i]);
            }
            return {
                "word": item, 
                "grade": sum
            }
        });

        data = data.sort((a, b) => {
            return (Math.random() - 0.5)  + (a.grade - b.grade)
        })

        data.reverse();

        //console.log(data);

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
    });

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
             char_history.length > 100 ? char_history.substring(1) : char_history + "1"
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

            result.innerHTML = final_res;
            mistakes.innerHTML = mistake_count + " بار، " + Math.round(mistake_count/num_chars * 100) + " درصد";
            text_length.innerHTML = num_chars;

            res_div.style.opacity = "100%";

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
                char_history.length > 100 ? char_history.substring(1) : char_history + "0"
            );
            mistake_count ++;
            repeated_mistake_flag = true;
        }
    }

    if(to_type.firstChild != null)
        to_type.firstChild.className = "blnk";

};
            load_keyboard_color();
