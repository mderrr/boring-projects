/* //////////////////////////////////////////////////////////////////////////////// ELEMENT GATHERING //////////////////////////////////////////////////////////////////////////////// */
let sections = document.getElementsByClassName("section");
let roll_button = document.getElementById("rollButton");
let confirm_button = document.getElementById("confirmButton");
let question_popup = document.getElementById("questionPopup");
let name_space = document.getElementById("nameSpace");
let question_space = document.getElementById("questionSpace");
let selector = document.getElementById("select");
let minimun_rotations = 10;
let number_of_sections = 16;
let degrees_to_rotate = 0;
let selection_point = 90;
let rotated = false;
let show =  true;
let round_number = 1;
let slice_size;
let question_list = [];
let section_name_list = [
    "Arias Ruiz Juan Esteban",
    "Berrio Uribe Marco",
    "Betancur Muñoz Santiago",
    "Blandón Delgado Leslly Valeria",
    "Calderon Briceno Darianna Ysabella",
    "Duran Rodríguez Maria Fernanda",
    "Hernandez Zapata Santiago",
    "Herrera Betancur María Camila",
    "Herrera Mesa Maria Camila",
    "Miranda Alzate Jorge Arturo",
    "Murillo Asprilla Jacobo",
    "Posada Cataño Elena",
    "Restrepo Restrepo Susana",
    "Ruiz Soto Juan Pablo",
    "Zarate Ospina Daniel",
    "Zuluaga Galeano David"];

/* //////////////////////////////////////////////////////////////////////////////////// FUNCTIONS //////////////////////////////////////////////////////////////////////////////////// */
function generateStartingPositions() {
    let starting_positions = [];
    let postion_index = 0;

    if (number_of_sections % 2 != 0) {
        postion_index = -1 * (slice_size / 2)
    } 

    for (let index = 0; index < number_of_sections; index++) {
        starting_positions.push(postion_index)
        postion_index += slice_size
    }
    
    return starting_positions
}

function hideSections() {
    rotateDivs(0, sections.length);

    for (let index = 0; index < sections.length; index++) {
        sections.item(index).style.visibility = "hidden";

        for (let section_index = 0; section_index < number_of_sections + 2; section_index++) {
            sections.item(index).classList.remove("section-" + index + "-from-" + section_index);
        }
    }
}

function makeSectionsVisible(number_of_sections) {
    hideSections()
    
    for (let index = 0; index < number_of_sections; index++) {
        sections.item(index).style.visibility = "visible";
        sections.item(index).classList.add("section-" + index + "-from-" + number_of_sections);
    }
}

function toggleTransitionAnimation() {
    for (let index = 0; index < number_of_sections; index++) {
        sections.item(index).classList.toggle("enableTransition")
    }
}

function rotateDivs(degrees, number_of_sections) {
    for (let index = 0; index < number_of_sections; index++) {
        let current_div_style = sections.item(index).style

        current_div_style.mozTransform = "rotate(" + degrees + "deg)";
        current_div_style.msTransform = "rotate(" + degrees + "deg)"; 
        current_div_style.oTransform = "rotate(" + degrees + "deg)"; 
        current_div_style.transform = "rotate(" + degrees + "deg)"; 
    }
}

function togglePopup() {
    question_popup.classList.toggle("active")
}

function setParticipant(choosen_index) {
    name_space.innerHTML = section_name_list[choosen_index]
    section_name_list.splice(choosen_index, 1)
}

function setQuestion(choosen_index) {
    question_space.innerHTML = question_list[choosen_index]
    question_list.splice(choosen_index, 1)
}

function getRandomQuestion() {
    let question_index = Math.floor(Math.random() * question_list.length);

    return question_index
}

function onRollButtonClick() {
    slice_size = 360 / number_of_sections;
    degrees_to_rotate += Math.floor((Math.random() * 360) + (minimun_rotations * slice_size));

    let current_section_starting_positions = []; 
    let starting_positions = generateStartingPositions()

    toggleTransitionAnimation()

    rotateDivs(degrees_to_rotate, number_of_sections)

    setTimeout(toggleTransitionAnimation, 1000)

    for (let index = 0; index < number_of_sections; index++) {
        section_start = ((degrees_to_rotate % 360) + starting_positions[index]) % 360;

        if (section_start > (360 - slice_size)) {
            section_start -= 360 
        }

        current_section_starting_positions.push(section_start)
    }
    
    for (let index = 0; index < number_of_sections; index++) {
        let current_section_start = current_section_starting_positions[index];
        let current_section_end = (current_section_starting_positions[index] + slice_size) % 360;
        if (current_section_start <= selection_point && current_section_end > selection_point) {
            setParticipant(index)
            setQuestion(getRandomQuestion())
            setTimeout(togglePopup, 1000);
        } 
    }
}

function onConfirmButtonClick() {
    number_of_sections -= 1

    if (number_of_sections == 0) {
        startNewRound()
    }

    togglePopup()
    initialize()
}

async function getQuestionList(){
    let participant_list = [];
    let options = {headers: {'Content-Type': 'text/csv;charset=ISO-8859-1'}};
    let response = await fetch("preguntas ronda " + round_number + ".csv", options)
    console.log(response.headers.get("Content-Type"))
    let data = await response.text();
    console.log(response.headers.get("Content-Type"))
    let participant_data = data.split("\n")
    
    for (let index = 0; index < participant_data.length; index++) {
        let individual_question = participant_data[index].split(",").splice(1, 1)
        participant_list.push(individual_question)
    }

    participant_list.splice(0, 1)
    
    for (let index = 0; index < participant_list.length; index++) {
        if (participant_list[index] == "") {
            participant_list.splice(index, 1)
        }
    }

    return participant_list
}

async function initialize() {
    degrees_to_rotate = 0;

    roll_button.addEventListener("click", onRollButtonClick)
    confirm_button.addEventListener("click", onConfirmButtonClick)

    makeSectionsVisible(number_of_sections)
}

function startNewRound() {
    round_number += 1
    number_of_sections = 16;
    
    section_name_list = [
        "Arias Ruiz Juan Esteban",
        "Berrio Uribe Marco",
        "Betancur Muñoz Santiago",
        "Blandón Delgado Leslly Valeria",
        "Calderon Briceno Darianna Ysabella",
        "Duran Rodríguez Maria Fernanda",
        "Hernandez Zapata Santiago",
        "Herrera Betancur María Camila",
        "Herrera Mesa Maria Camila",
        "Miranda Alzate Jorge Arturo",
        "Murillo Asprilla Jacobo",
        "Posada Cataño Elena",
        "Restrepo Restrepo Susana",
        "Ruiz Soto Juan Pablo",
        "Zarate Ospina Daniel",
        "Zuluaga Galeano David"
    ];

    start()
}

async function start() {
    question_list = await getQuestionList()
    initialize()
}

/* ////////////////////////////////////////////////////////////////////////////////// CODE ////////////////////////////////////////////////////////////////////////////////// */
setTimeout(start, 20)