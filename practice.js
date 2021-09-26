function setCookie(name, value, daysToLive) { var cookie = name + "=" + encodeURIComponent(value); if(typeof daysToLive === "number") { cookie += "; max-age=" + (daysToLive*24*60*60); document.cookie = cookie; } }
function getCookie(name) { var cookieArr = document.cookie.split(";"); for(var i = 0; i < cookieArr.length; i++) { var cookiePair = cookieArr[i].split("="); if(name == cookiePair[0].trim()) { return decodeURIComponent(cookiePair[1]); } } return 0; }
function beep(correct) { 
    url = "sound_keystroke.mp3";
    if(correct != true){
        url = "sound_error.mp3";
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


function reload_page(sec) {
    if (sec > 0) {
        setTimeout(() => reload_page(sec - 1), 1000)
        repeat.innerHTML = " تکرار تا " + "<b>" + sec + "</b>" + " ثانیه دیگر ";
    }else{
        location.reload();
    }
}


var num_chars = 0; 
var num_words = 0; 

base_courses_path = 'data/'; 


hash = window.location.hash.replace("#", "");

document.getElementById("num").innerHTML = getCookie(hash + "_count");
document.getElementById("doc_date").innerHTML = new Date().toLocaleDateString('fa-IR');
document.getElementById("appendix").innerHTML = "بهترین:" + getCookie(hash + "_max");

fetch(base_courses_path + hash)
    .then(response => response.text())
    .then(data => {
        data = data.replace("\n", "");
        data = data.replace("\r", "");
        data = data.split(" ");
        data = data.sort(() => Math.random() - 0.5)
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
    });

var t0 = null;
var mistake_count = 0;

var repeated_mistake_flag = false;

document.onkeypress = function(evt) {
    if(t0 == null)
        t0 = performance.now();

    evt = evt || window.event;
        

    if ((evt.key == to_type.innerText[0]) || (evt.key == ' ' && to_type.innerText[0] == '␣')) {

        beep(1);

        repeated_mistake_flag = false;

        to_type.firstChild.className = "";
        typed.appendChild(to_type.firstChild);

        if(typed.lastChild.style.color == "red")
            typed.lastChild.style.color = "#3498DB";

        if(to_type.innerText.length == 0){
            t1 = performance.now();

            wpm = (num_words/(t1-t0)*60000);

            final_res = Math.round(wpm* 10) / 10;

            if(final_res > getCookie(hash + "_max")){
                setCookie(hash + "_max", final_res, 100000);
            }

            setCookie(hash + "_avg", Math.round((parseFloat(getCookie(hash + "_avg")) * parseFloat(getCookie(hash+ "_count")) + final_res)/(parseFloat(getCookie(hash + "_count")) +1 ) * 10)/10  , 100000);
            setCookie(hash + "_count", parseFloat(getCookie(hash + "_count"))+1, 100000);

            result.innerHTML = final_res;
            mistakes.innerHTML = mistake_count + " بار، " + Math.round(mistake_count/num_chars * 100) + " درصد";
            text_length.innerHTML = num_chars;

            res_div.style.display = "block";

            reload_page(5); //reload in seconds
        }

    }else{
        beep(0);
        to_type.firstChild.style.color = "red";
        if(!repeated_mistake_flag){
            mistake_count ++;
            repeated_mistake_flag = true;
        }
    }


    to_type.firstChild.className = "blnk";
};
