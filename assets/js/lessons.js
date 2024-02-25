// function saveValue(name, value) { 
//     window.localStorage.setItem(name, value);
// }
// function getValue(name) { 
//     res = window.localStorage.getItem(name);
//     return res? res : "";
// }

// // Tabbed Menu
// function openMenu(evt, menuName) {
//     var i, x, tablinks;
//     x = document.getElementsByClassName("menu");
//     for (i = 0; i < x.length; i++) {
//         x[i].style.display = "none";
//     }
//     tablinks = document.getElementsByClassName("tablink");
//     for (i = 0; i < x.length; i++) {
//         tablinks[i].className = tablinks[i].className.replace(" w3-dark-grey", "");
//     }
//     document.getElementById(menuName).style.display = "block";
//     evt.currentTarget.firstElementChild.className += " w3-dark-grey";
// }

// function create_course(cat) {
//     tab_title = document.createElement("a");
//     tab_title.href = '#courses';
//     tab_title.onclick = function(e){
//         openMenu(e, "tab_" + cat.id);
//     }
//     tab_title.innerHTML = '<div class="w3-col s6 tablink"><b>' + cat.category+ '</b></div>';

//     document.getElementById("tabs").prepend(tab_title);

//     tab_body = document.createElement("div");
//     tab_body.id = "tab_" + cat.id;
//     tab_body.className = "w3-container menu w3-padding-48 w3-card";

//     document.getElementById("tabs").parentNode.appendChild(tab_body);

//     cat.lessons.forEach((course, index) => {

//         title = document.createElement("b"); 

//         title_link = document.createElement("a");
//         title_link.href = "practice.html?" + course.dataset;
//         title_link.target = "_parent";
//         title_link.innerHTML = "&#8226; " + course.title;     

//         title.appendChild(title_link);

//         speed = document.createElement("span"); 
//         if(getValue(course.dataset) != null){
//             speed.innerHTML = " بهترین:" + getValue(course.dataset + "_max") +
//                 "؛ میانگین: " + getValue(course.dataset + "_avg") + 
//                 " دفعات: " + getValue(course.dataset + "_count") + " بار";
//             reset = document.createElement("a");
//             reset.innerHTML = "<u>بازنشانی آمار</u>";
//             reset.style.cursor = "pointer";
//             reset.style.float = "left";
//             reset.onclick = function(e){
//                 saveValue(course.dataset + "_max", 0);
//                 saveValue(course.dataset + "_avg", 0);
//                 saveValue(course.dataset + "_count", 0);

//                 location.reload();
//             }
//             speed.append(reset);
//         }
//         speed.className = "w3-text-grey";

//         br = document.createElement("br"); 

//         document.getElementById("tab_" + cat.id).appendChild(title);      
//         document.getElementById("tab_" + cat.id).appendChild(speed);      
//         document.getElementById("tab_" + cat.id).appendChild(br);      

//     });
// }

// document.getElementById("tab_title_learn").onclick = function(e){
//     openMenu(e, "tab_learn");
//     e.preventDefault();
// }


// cat = {
//     "category": "تمرین",
//     "id": "first_tab",
//     "lessons": [ {
//         "title": "<i style='color:red'>یادگیری هوشمند </i>",
//         "dataset" : "ai"
//     } ]
// }

// for(i = 1; i<= 20; i++){
//     cat.lessons.push(
//         {
//             "title": "پرکاربردترین‌های  " + i, 
//             "dataset" : i
//         }
//     );
// }

// create_course(cat);
// document.getElementById("tabs").firstChild.click();



const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

function saveValue(name, value) {
    window.localStorage.setItem(name, value);
}
function getValue(name) {
    res = window.localStorage.getItem(name);
    return res ? res : "";
}


class ContentList{
    constructor(){
        this.lessons = {
            ai: {
                name: 'یادگیری هوشمند'
            },
            edari: {
                name:"واژگان پرکابرد اداری"
            }
        }

        this.__construct_sub_lessons(20);

        // console.log(this.lessons)

        this.__load_lessons_stats();
        this.__create_and_append_lessons_list();

    }

    __construct_sub_lessons(number_of_lessons){
        for(let i = 0; i < number_of_lessons; i++){
            this.lessons['ai' + i] = {name: "پرکاربردترین‌های " + (parseInt(i) + 1)}
        }
    }

    __load_lessons_stats(){
        const lesson_slugs = Object.keys(this.lessons)

        for(let lesson_slug of lesson_slugs){
            this.lessons[lesson_slug].stats = this.__getStatsForLesson(lesson_slug)
        }

        // console.log(this.lessons)
    }

    __create_and_append_lessons_list(){
        let content_list = $("#content_list")
        let template = $("#content_list li");

        Object.keys(this.lessons).forEach((key) => {
            let list_elem = template.cloneNode(true);
            list_elem.classList.remove('template')

            list_elem.querySelector(".name").parentNode.href = "practice.html?" + key

            list_elem.querySelector(".name").innerHTML = this.lessons[key].name

            if(this.lessons[key].stats.best != '0'){ // if it has a history ...
                list_elem.querySelector(".max").innerHTML = this.lessons[key].stats.best
                list_elem.querySelector(".avg").innerHTML = this.lessons[key].stats.average
                list_elem.querySelector(".count").innerHTML = this.lessons[key].stats.count
                
                list_elem.querySelector('.reset_stats').onclick = () => {
                    saveValue(key+"_max", 0);
                    saveValue(key+"_avg", 0);
                    saveValue(key+"_count", 0);

                    window.location.reload()
                }

            }else{ // hide stat_line
                list_elem.querySelector(".stat_line").style.display = "none"
            }

            content_list.appendChild(list_elem)
        })

    }

    __getStatsForLesson(lesson){
        return {
            best:     getValue(lesson + "_max") || "0",
            average:  getValue(lesson + "_avg") || "0",
            count:    getValue(lesson + "_count") || "0"
        }
    }
    
}

new ContentList()