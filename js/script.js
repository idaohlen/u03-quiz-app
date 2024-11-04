
const quizApp = document.getElementById("app");

let selectedQuestions;

function renderStartPage(){
    //Head container for the startpage
    const startPage = document.createElement('div');
    startPage.id = 'startpage'; 

    //Container for the quiz-titel
    const container=document.createElement('div');
    container.id='container';
    container.classList.add("container"); 

    const title=document.createElement('h1');
    title.textContent ='Quiz'; 
    container.appendChild(title);
    startPage.appendChild(container);

    const buttonContainer = document.createElement("div");
    buttonContainer.id = "button-container";
    
    const categories = ["Djur", "Sport", "Musik"];
    categories.forEach(category => {
        const categoryButton = document.createElement("button");
        categoryButton.id = "button-container__button";
        categoryButton.textContent = category;
        buttonContainer.appendChild(categoryButton);
    });
    startPage.appendChild(buttonContainer);

    const startButtonContainer = document.createElement("div");
    startButtonContainer.className = "button-container";
    const startButton = document.createElement("button");
    startButton.id = "button-container__start";
    startButton.className = "button-container__start";
    startButton.textContent = "Start";
    startButtonContainer.appendChild(startButton);
    startPage.appendChild(startButtonContainer);


    // Highscore-sektionen
    const highscoreSection = document.createElement("div");
    highscoreSection.id = "highscore-section";
    highscoreSection.className = "highscore-section";
    const highscoreTitle = document.createElement("h2");
    highscoreTitle.textContent = "Highscore";
    highscoreSection.appendChild(highscoreTitle);
    
    const highscoreTable = document.createElement("div");
    highscoreTable.id = "highscore-table";
    highscoreTable.className = "highscore-table";
    
    const table = document.createElement("table");
    highscoreTable.appendChild(table);

    const highscoreData = [
        { score: "10p", date: "10/4/2024" },
        { score: "10p", date: "10/4/2024" }
    ];

    highscoreData.forEach(data => {
        const row = document.createElement("tr");
        const scoreCell = document.createElement("td");
        scoreCell.textContent = data.score;
        const dateCell = document.createElement("td");
        dateCell.textContent = data.date;
        row.appendChild(scoreCell);
        row.appendChild(dateCell);
        table.appendChild(row);
    });

    highscoreTable.appendChild(table);
    highscoreSection.appendChild(highscoreTable);
    startPage.appendChild(highscoreSection);

    // Add the startPage div to body
    quizApp.appendChild(startPage);
}
renderStartPage()


// QUESTIONS PAGE

// Render the Question Page
function renderQuestionPage(question) {
  // Create the question wrapper div
  const questionWrapper = document.createElement("div");
  questionWrapper.id = "questionWrapper";
  questionWrapper.classList.add("question");

  // TODO: Randomize order of answers

  // Put correct answer + incorrect answers into an array
  const answers = [question.correctAnswer, ...question.incorrectAnswers];

  let answersHTML = "";

  // Loop through the answers array and add an HTML element for each of them into the answersHTML variable
  for (let i = 0; i < answers.length; i++) {
    answersHTML += `<input type="button" data-id="${question._id['$oid']}" class="question__option" value="${answers[i]}">`;
  }

  // Add HTML content to the question wrapper:
  //  - Question text
  //  - Question options
  //  - Next question button
  questionWrapper.innerHTML = `
    <div id="questionText" class="question__text">${question.text}</div>

    <div id="optionsContainer" class="question__options-container">${answersHTML}</div>

    <input type="button" class="next-button" id="nextButton" value="Nästa fråga">`;
    
    quizApp.appendChild(questionWrapper);
    
    document.getElementById('nextButton').addEventListener('click', displayNextQuestion());

    // Add the question wrapper div to the quiz app main container
}

function renderEndPage () {
    const mainWrapper = document.createElement('main');
    mainWrapper.className = 'result-main';

    const header = document.createElement('header');
    header.className = 'result-header';
    mainWrapper.appendChild(header); // Append header to main

    const h1Result = document.createElement('h1');
    h1Result.textContent = 'Slutresultat';
    header.appendChild(h1Result); // Append h1 to header

    const paragraph = document.createElement('p');
    paragraph.textContent = '10 av 10 rätt!';
    paragraph.id = 'showScore';
    paragraph.className = 'show-score';
    header.appendChild(paragraph); // Append p to header

    const resultBtn = document.createElement('button');
    resultBtn.textContent = 'Visa resultat';
    resultBtn.id = 'resultBtn';
    resultBtn.className = 'result-btn'
    header.appendChild(resultBtn); // Append result button to header

    const resultList = document.createElement('ul');
    resultList.className = 'result-list';
    resultList.id = 'resultContainer';
    // Create li element for each item
    const resultItem = ['Fråga 1', 'Fråga 2', 'Fråga 3', 'Fråga 4', 'Fråga 5', 'Fråga 6', 'Fråga 7', 'Fråga 8', 'Fråga 9', 'Fråga 10'];
    resultItem.forEach(itemText => {
        const item = document.createElement('li');
        item.textContent = itemText;
        item.className = 'result-item';
        resultList.appendChild(item)
    });
    
    mainWrapper.appendChild(resultList); // Append UL list to main

    const newRoundDiv = document.createElement('div');
    newRoundDiv.className = 'new-round';
    mainWrapper.appendChild(newRoundDiv); // Append div to main

    const newRoundBtn = document.createElement('button');
    newRoundBtn.textContent = 'Kör en ny omgång';
    newRoundBtn.id = 'newRoundBtn';
    newRoundBtn.classList = 'new-round-btn';
    newRoundDiv.appendChild(newRoundBtn); // Append button to div

    quizApp.appendChild(mainWrapper)

}

// QUESTION PARSER

document.addEventListener("DOMContentLoaded", function() {
    const questionsFile = "./questionDataBase.questions.json"
    const chosenCategory = "Historia";
    const questionAmount = 10;
    let questionsList;

    parseQuestions(questionsFile).then(allQuestions => {
        questionsList = allQuestions;
        selectedQuestions = generateQuestions(chosenCategory, questionAmount, questionsList)
        console.log(selectedQuestions)
    });

    /* Placeholder code snippet to trigger generation of questions */ 
    const startButton = document.querySelector(".button-container__start");

    startButton.addEventListener("click", () => { 
        document.getElementById('startpage').innerHTML = '';
        renderQuestionPage(newQuestion())
        
    })


});

const parseQuestions = async (fileName) => {
    const fileContent = await (await fetch(fileName)).text()
    const allQuestions = JSON.parse(fileContent)
    return allQuestions
}

const generateQuestions = (category, amount, questionList) => {
    const categoryQuestions = questionList.filter(question => question.tags.includes(category))

    if(categoryQuestions.length < amount) throw new Error(`Not enough questions for category "${category}" in the JSON file`);
    let generatedQuestions = []
    while(generatedQuestions.length < amount)
        {
            generatedQuestions.push(categoryQuestions.splice(Math.floor(Math.random() * categoryQuestions.length), 1)[0])
        }
    return generatedQuestions;
}

// DISPLAY QUESTION

function newQuestion () {
    const question = selectedQuestions.pop();
    return question;
};

function displayNextQuestion () {
    document.getElementById('questionWrapper').innerHTML = '';
        renderQuestionPage(newQuestion())
}