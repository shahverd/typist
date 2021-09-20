
function setCookie(name, value, daysToLive) { var cookie = name + "=" + encodeURIComponent(value); if(typeof daysToLive === "number") { cookie += "; max-age=" + (daysToLive*24*60*60); document.cookie = cookie; } }
function getCookie(name) { var cookieArr = document.cookie.split(";"); for(var i = 0; i < cookieArr.length; i++) { var cookiePair = cookieArr[i].split("="); if(name == cookiePair[0].trim()) { return decodeURIComponent(cookiePair[1]); } } return 0; }
// Tabbed Menu
function openMenu(evt, menuName) {
    var i, x, tablinks;
    x = document.getElementsByClassName("menu");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < x.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" w3-dark-grey", "");
    }
    document.getElementById(menuName).style.display = "block";
    evt.currentTarget.firstElementChild.className += " w3-dark-grey";
}


fetch('https://gist.githubusercontent.com/shahverd/841ebfebd28286e614bfc2fc057869e1/raw')
    .then(response => response.json())
    .then(data => {


        data.forEach((cat, cat_index) => {
            tab_title = document.createElement("a");
            tab_title.href = 'javscript:void(0)';
            tab_title.onclick = function(e){
                openMenu(e, "tab_" + cat.id);
            }
            tab_title.innerHTML = '<div class="w3-col s3 tablink"><b>' + cat.category+ '</b></div>';

            document.getElementById("tabs").appendChild(tab_title);

            tab_body = document.createElement("div");
            tab_body.id = "tab_" + cat.id;
            tab_body.className = "w3-container menu w3-padding-48 w3-card";

            document.getElementById("tabs").parentNode.appendChild(tab_body);





         cat.lessons.forEach((course, index) => {
                console.log(course);



                title = document.createElement("b"); 

                title_link = document.createElement("a");
                title_link.href = "pracitce.html#" + course.hash;
                title_link.target = "_blank";
                title_link.innerHTML = (index+1) + "- " + course.title;     

                title.appendChild(title_link);

                speed = document.createElement("span"); 
                if(getCookie(course.hash) != null){
                    speed.innerHTML = " بهترین:" + getCookie(course.hash + "_max") +
                                      "؛ میانگین: " + getCookie(course.hash + "_avg") + 
                                      " دفعات: " + getCookie(course.hash + "_count") + " بار";
                    reset = document.createElement("a");
                    reset.innerHTML = "<u>بازنشانی آمار</u>";
                    reset.style.cursor = "pointer";
                    reset.style.float = "left";
                    reset.onclick = function(e){
                        setCookie(course.hash + "_max", 0, 100000);
                        setCookie(course.hash + "_avg", 0, 100000);
                        setCookie(course.hash + "_count", 0, 100000);

                        location.reload();
                    }
                    speed.append(reset);
                }
                speed.className = "w3-text-grey";

                br = document.createElement("br"); 

                document.getElementById("tab_" + cat.id).appendChild(title);      
                document.getElementById("tab_" + cat.id).appendChild(speed);      
                document.getElementById("tab_" + cat.id).appendChild(br);      

            });
        });
    }).then(() => {

        document.getElementById("tabs").firstChild.click();
    });


