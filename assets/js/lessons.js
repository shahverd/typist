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