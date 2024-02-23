function saveValue(name, value) { 
    window.localStorage.setItem(name, value);
}
function getValue(name) { 
    res = window.localStorage.getItem(name);
    return res? res : "";
}

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

function create_course(cat) {
    tab_title = document.createElement("a");
    tab_title.href = '#courses';
    tab_title.onclick = function(e){
        openMenu(e, "tab_" + cat.id);
    }
    tab_title.innerHTML = '<div class="w3-col s6 tablink"><b>' + cat.category+ '</b></div>';

    document.getElementById("tabs").prepend(tab_title);

    tab_body = document.createElement("div");
    tab_body.id = "tab_" + cat.id;
    tab_body.className = "w3-container menu w3-padding-48 w3-card";

    document.getElementById("tabs").parentNode.appendChild(tab_body);

    cat.lessons.forEach((course, index) => {

        title = document.createElement("b"); 

        title_link = document.createElement("a");
        title_link.href = "practice.html?" + course.dataset;
        title_link.target = "_parent";
        title_link.innerHTML = "&#8226; " + course.title;     

        title.appendChild(title_link);

        speed = document.createElement("span"); 
        if(getValue(course.dataset) != null){
            speed.innerHTML = " بهترین:" + getValue(course.dataset + "_max") +
                "؛ میانگین: " + getValue(course.dataset + "_avg") + 
                " دفعات: " + getValue(course.dataset + "_count") + " بار";
            reset = document.createElement("a");
            reset.innerHTML = "<u>بازنشانی آمار</u>";
            reset.style.cursor = "pointer";
            reset.style.float = "left";
            reset.onclick = function(e){
                saveValue(course.dataset + "_max", 0);
                saveValue(course.dataset + "_avg", 0);
                saveValue(course.dataset + "_count", 0);

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
}

document.getElementById("tab_title_learn").onclick = function(e){
    openMenu(e, "tab_learn");
    e.preventDefault();
}


cat = {
    "category": "تمرین",
    "id": "first_tab",
    "lessons": [ {
        "title": "<i style='color:red'>یادگیری هوشمند </i>",
        "dataset" : "ai"
    } ]
}

for(i = 1; i<= 20; i++){
    cat.lessons.push(
        {
            "title": "پرکاربردترین‌های  " + i, 
            "dataset" : i
        }
    );
}

create_course(cat);
document.getElementById("tabs").firstChild.click();
