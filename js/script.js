import { calculateScore, shuffleArray, saveToLocalStorage, saveAnswer, getHighscoreData } from "./utils.js";

const quizApp = document.getElementById("app");
const dialog = document.getElementById("dialog");
const dialogContent = document.getElementById("dialogContent");

const categories = [
  {name: "Musik", icon: "icon-music", class: "category-music"},
  {name: "TV & Film", icon: "icon-movies", class: "category-movies"},
  {name: "Litteratur", icon: "icon-literature", class: "category-literature"},
  {name: "Geografi", icon: "icon-world", class: "category-geography"},
  {name: "Historia", icon: "icon-hourglass", class: "category-history"},
  {name: "Språk", icon: "icon-chat", class: "category-languages"},
];

let allQuestions;
let selectedQuestions;
const questionsFile = "./questionDataBase.questions.json";
const questionAmount = 5;
const savedAnswers = [];
let timerInterval;
let timer;
let baseTimer = 10000;

let correctAnswersAmount = 0;
let highScore = 0;

let currentCategory;

/* ------------------------------------------------ */
// START PAGE
/* ------------------------------------------------ */

function renderStartPage() {
  savedAnswers.splice(0);
  correctAnswersAmount = 0;
  highScore = 0;

  // Create categories HTML
  let categoriesHTML = "";
  categories.forEach((category) => {
    categoriesHTML += `<button class="category-button ${category.class}" data-id="${category.name}">
    <i class="category-icon ${category.icon}"></i>
    ${category.name}
    </button>`;
  });

  quizApp.innerHTML = `
    <h1>Quiz</h1>
    <div class="categories-container">
    ${categoriesHTML}
    <button class="button categories-mixed-button" data-id="Blandat">
      <div class="button__text">Blandade frågor</div> 
      <i class="icon icon-shuffle"></i>
    </button>
    <button class="button button--dark highscore-button" id="highscoreButton">
      <div class="button__text">Top 10 Highscores</div>
      <i class="icon icon-trophy"></i>
    </button>
    </div>
  `;
}

function displayHighscore() {
  const highscoreData = getHighscoreData();
  let highscoreHTML = `<button id="closeModalButton"><i class="icon-close"></i></button>`;
  if (highscoreData) { 
    highscoreData.forEach((highscore) => {
      highscoreHTML += `
      <div class="highscore">
        <div class="highscore__score">Highscore: ${highscore.highscore}</div>
        <div class="highscore__score">Date: ${highscore.date}</div>
      </div>
    `;
    });
  }
  dialogContent.innerHTML = highscoreHTML;
  dialog.showModal();
}

function closeModal() {
  dialog.close();
}


/* ------------------------------------------------ */
// QUESTIONS PAGE
/* ------------------------------------------------ */

function renderQuestionPage(question) {
  // Create the question wrapper div
  const questionWrapper = document.createElement("div");
  questionWrapper.id = "questionWrapper";
  questionWrapper.classList.add("question");

  // Put correct answer + incorrect answers into an array
  const answers = shuffleArray([question.correctAnswer, ...question.incorrectAnswers]);

  let answersHTML = "";


  // Loop through the answers array and add an HTML element for each of them into the answersHTML variable
  for (let i = 0; i < answers.length; i++) {
    let answerLetter = "A";
    if (i === 1) answerLetter = "B";
    else if (i === 2) answerLetter = "C";

    answersHTML += `
    
    <div data-id="${question._id["$oid"]}" data-answer="${answers[i]}" class="question__option">
      <div class="question__answer-letter">${answerLetter}</div>
      <div class="question__answer-text">${answers[i]}</div>
    </div>`;
  }

  // Add HTML content to the question wrapper
  questionWrapper.innerHTML = `
    <div class="timer-progress">
      <div class="timer-progress__bar" id="progressBar">
        <div class="timer-progress__status" id="barStatus"></div>
      </div>
    </div>
    
    <div class="timer grow">
      <div class="timer__time" id="timer">10.0</div>
      <div class="timer__unit">sek kvar</div>
    </div>

    <div id="questionText" class="question__text slideTextIn">
      ${question.text}
    <i class="question__bg-icon ${findCategoryByName(currentCategory)?.icon}"></i>
    </div>
    <div id="optionsContainer" class="question__options-container">${answersHTML}</div>`;

  // Add the question wrapper div to the quiz app container
  quizApp.appendChild(questionWrapper);

  const questionOptions = document.querySelectorAll(".question__option");

  const handleClick = (e) => {
    clearInterval(timerInterval);
    addSlideOut(questionOptions);
    savedAnswers.push(
      saveAnswer(question, e.target.closest(".question__option").getAttribute("data-answer"), (timer / 1000))
    );
    questionOptions.forEach(o => {
      o.removeEventListener("click", handleClick)
  });
    setTimeout(() => document.querySelector(".question__text").classList.toggle("slideTextOut"), 1000);
    setTimeout(displayNextQuestion, 1500);
  };

  questionOptions.forEach((option, index) => {
    option.addEventListener("click", handleClick);
    addSlideIn(option, index);
  });

  startTimer(question, questionOptions);
}

function startTimer(question, questionOptions) {
  timer = baseTimer;
  const timerDiv = document.getElementById("timer")
  const progressBar = document.getElementById("barStatus");
  progressBar.style.width = "100%";

  setTimeout(() => {
    timerInterval = setInterval(progressTimer, 10);
    function progressTimer() {
      if(timer >= 0) {
        timer -= 10;
        // timerDiv.innerHTML = Math.ceil(timer/1000);
        timerDiv.innerHTML = Math.abs(timer/1000).toFixed(1);
        progressBar.style.width = (timer/100) + "%"; 
      }
      else {
        clearInterval(timerInterval);
        savedAnswers.push(saveAnswer(question, "Svarade inte", 0));
        addSlideOut(questionOptions);
        setTimeout(() => document.querySelector(".question__text").classList.toggle("slideTextOut"), 1000);
        setTimeout(displayNextQuestion, 2000);
      }
    }
  }, 1500)
}


function addSlideOut(questionOptions) {
  const delay = 200;
  questionOptions.forEach((option, index) => {
    setTimeout(() => option.classList.add("slideOut"), delay * index);
  });
}

function addSlideIn(option, index) {
  const delay = 200;
  setTimeout(() => {
    option.classList.add("slideIn");
  }, delay * index);
}

function findCategoryByName(name) {
  return categories.find(category => category.name === name);
}

/* ------------------------------------------------ */
// END PAGE
/* ------------------------------------------------ */

function renderEndPage() {
  savedAnswers.forEach((result) => {
    if (result.selectedAnswer === result.correctAnswer) {
      correctAnswersAmount++;
      highScore += calculateScore(result.timeLeft);
    }
  });

  quizApp.innerHTML = `
    <h1>Slutresultat</h1>
    <p id="showScore" class="show-score">${correctAnswersAmount} av ${questionAmount} rätt</p>
    <p class="high-score">Highscore ${highScore}🏆</p>
    <div class="button-container">
      <button id="resultButton" class="button result-button">Visa resultat</button>
      <button id="restartButton" class="button button--dark restart-button">Kör en ny omgång</button>
    </div>
`;
  saveToLocalStorage(highScore);
}


/* ------------------------------------------------ */
// PARSE QUESTIONS
/* ------------------------------------------------ */

async function parseQuestions(fileName) {
  try {
    const fileContent = await (await fetch(fileName)).json();
    return fileContent;
  } catch (e) {
    throw new Error(`HTTP ERROR STATUS ${fileContent.status}`);
  }
}

function generateQuestions(category, amount, questionList) {
  let categoryQuestions;
  if (category !== "Blandat") {
    categoryQuestions = questionList.filter((question) =>
      question.tags.includes(category)
    );
  } else {
    categoryQuestions = questionList;
  }

  if (categoryQuestions.length < amount)
    throw new Error(
      `Not enough questions for category "${category}" in the JSON file`
    );
  let generatedQuestions = [];
  while (generatedQuestions.length < amount) {
    generatedQuestions.push(
      categoryQuestions.splice(
        Math.floor(Math.random() * categoryQuestions.length),
        1
      )[0]
    );
  }
  return generatedQuestions;
}

/* ------------------------------------------------ */
// DISPLAY QUESTION
/* ------------------------------------------------ */

function newQuestion() {
  const question = selectedQuestions.pop();
  return question;
}

function displayNextQuestion() {
  const currentQuestion = document.getElementById("questionWrapper");
  if (currentQuestion) {
    quizApp.removeChild(currentQuestion);
  }
  const nextQuestion = newQuestion();
  if (nextQuestion) {
    renderQuestionPage(nextQuestion);
  } else {
    renderEndPage(); // No more questions, show the end page
  }
}

/* ------------------------------------------------ */
// RESULTS
/* ------------------------------------------------ */

function showResult() {
    let resultHTML = `<button id="closeModalButton"><i class="icon-close"></i></button>`;
    savedAnswers.forEach((result) => {
        resultHTML += `<div class="result-list__item">${result.questionText}</div>
        <div class="selected-answer">Ditt svar: ${result.selectedAnswer}</div>
        <div class="correct-answer">Korrekt svar: ${result.correctAnswer}</div>`;
      });

    dialogContent.innerHTML = resultHTML;
    dialog.showModal();
}


/* ------------------------------------------------ */
// EVENT DELEGATOR
/* ------------------------------------------------ */

document.body.addEventListener("click", (e) => {
  // Begin quiz when clicking the category
  if (e.target.closest(".category-button")  ||  e.target.closest(".categories-mixed-button")?.getAttribute("data-id") === "Blandat") {
    quizApp.innerHTML = "";
    const chosenCategory = e.target.closest(".category-button")?.getAttribute("data-id") || "Blandat";
    selectedQuestions = generateQuestions(
      chosenCategory,
      questionAmount,
      allQuestions
    );

    currentCategory = chosenCategory;

    renderQuestionPage(newQuestion());
  } else if (e.target.id === "restartButton") {
    renderStartPage();
  } else if (e.target.closest("#highscoreButton")) {
    displayHighscore();
  } else if (e.target.closest("#closeModalButton")) {
    closeModal();

  } else if (e.target.id === "resultButton"){
    showResult();
    }
});

/* ------------------------------------------------ */
// RUN INITIAL CODE
/* ------------------------------------------------ */

renderStartPage();
allQuestions = await parseQuestions(questionsFile);
