function setCookie(name, value, daysToLive) { var cookie = name + "=" + encodeURIComponent(value); if(typeof daysToLive === "number") { cookie += "; max-age=" + (daysToLive*24*60*60); document.cookie = cookie; } }
function getCookie(name) { var cookieArr = document.cookie.split(";"); for(var i = 0; i < cookieArr.length; i++) { var cookiePair = cookieArr[i].split("="); if(name == cookiePair[0].trim()) { return decodeURIComponent(cookiePair[1]); } } return 0; }
function beep(correct) { 
    url = "keystroke.mp3";
    if(correct != true){
        url = "error.mp3";
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

base_gist_path = 'https://gist.githubusercontent.com/shahverd/'; 


hash = window.location.hash.replace("#", "");

document.getElementById("num").innerHTML = getCookie(hash + "_count");
document.getElementById("doc_date").innerHTML = new Date().toLocaleDateString('fa-IR');

fetch(base_gist_path + hash + '/raw')
    .then(response => response.text())
    .then(data => {
        to_type.innerHTML = data; 
        num_chars = data.length;
        num_words = parseFloat(data.length)/5;
    });

var t0 = null;
var mistake_count = 0;

var repeated_mistake_flag = false;

document.onkeypress = function(evt) {
    if(t0 == null)
        t0 = performance.now();

    evt = evt || window.event;

    if (evt.key == to_type.innerHTML[0]) {

        beep(1);

        repeated_mistake_flag = false;

        var str = typed.innerHTML;
        typed.innerHTML = str.concat(to_type.innerHTML[0]);

        var to_type_str = to_type.innerHTML;
        to_type_str = to_type_str.slice(1, to_type_str.length);
        to_type.innerHTML = to_type_str;

        if(to_type_str.length == 0){
            t1 = performance.now();

            wpm = (num_words/(t1-t0)*60000);

            final_res = Math.round(wpm* 10) / 10;

            if(final_res > getCookie(hash + "_max")){
                setCookie(hash + "_max", final_res, 100000);
            }

            setCookie(hash + "_avg", Math.round((parseFloat(getCookie(hash + "_avg")) * parseFloat(getCookie(hash+ "_count")) + final_res)/(parseFloat(getCookie(hash + "_count")) +1 ) * 10)/10  , 100000);
            setCookie(hash + "_count", parseFloat(getCookie(hash + "_count"))+1, 100000);

            result.innerHTML = final_res;
            mistakes.innerHTML = Math.round(mistake_count/num_chars * 100);
            text_length.innerHTML = num_chars;

            res_div.style.display = "block";

            reload_page(3); //reload in 3 seconds
        }

    }else{
        beep(0);
        if(!repeated_mistake_flag){
            mistake_count ++;
            repeated_mistake_flag = true;
        }
    }
};
