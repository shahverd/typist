
to_type = document.getElementById("to_type");
typed = document.getElementById("typed")
res_div = document.getElementById("res_div")
result = document.getElementById("result")
mistakes = document.getElementById("mistakes")
text_length = document.getElementById("text_length")

var num_chars = 0; 
var num_words = 0; 

base_gist_path = 'https://gist.githubusercontent.com/shahverd/'; 


hash = window.location.hash.replace("#", "");


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

        repeated_mistake_flag = false;

        var str = typed.innerHTML;
        typed.innerHTML = str.concat(to_type.innerHTML[0]);

        var to_type_str = to_type.innerHTML;
        to_type_str = to_type_str.slice(1, to_type_str.length);
        to_type.innerHTML = to_type_str;

        if(to_type_str.length == 0){
            t1 = performance.now();

            wpm = (num_words/(t1-t0)*60000);

            result.innerHTML = (Math.round(wpm* 10) / 10);
            mistakes.innerHTML = Math.round(mistake_count/num_chars * 100);
            text_length.innerHTML = num_chars;

            res_div.style.display = "block";
        }

    }else{
        if(!repeated_mistake_flag){
            mistake_count ++;
            repeated_mistake_flag = true;
        }
    }
};
