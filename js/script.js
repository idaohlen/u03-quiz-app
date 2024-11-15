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
const questionAmount = 10;
const savedAnswers = [];

let timerInterval;
let timer;
let baseTimer = 10000;
let questionRunning = false;

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
    ${createTitle()}

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

function createTitle(forQuestionPage = false) {
  return `
      <hgroup class="title ${forQuestionPage ? "title-question-page" : ""}">
        <h1 class="title__heading">QuizApp</h1>
        <p class="title__subtitle">By Tech Titans</p>
        <div class="title__icon"><i class="icon icon-chat_bubbles"></i></div>
      </hgroup>
  `;
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
    <div class="question__title">${createTitle(true)}</div>

      <div class="timer grow">
        <div class="timer__time" id="timer">10.0</div>
        <div class="timer__unit">sek kvar</div>
      </div>

      <div id="questionText" class="question__text-container slideTextIn">
        <div class="question__text">
          ${question.text}
          <i class="question__bg-icon ${findCategoryByName(currentCategory)?.icon}"></i>
        </div>
      </div>

      <div id="optionsContainer" class="question__options-container">${answersHTML}</div>

      <div class="timer-progress">
        <div class="timer-progress__bar" id="progressBar">
          <div class="timer-progress__status" id="barStatus"></div>
        </div>
      </div>
    `;

  // Add the question wrapper div to the quiz app container
  quizApp.appendChild(questionWrapper);

  const questionOptions = document.querySelectorAll(".question__option");

  const handleClick = (e) => {
    questionRunning = false;
    clearInterval(timerInterval);

    savedAnswers.push(
      saveAnswer(question, e.target.closest(".question__option").getAttribute("data-answer"), (timer / 1000))
    );
    questionOptions.forEach(o => {
      o.removeEventListener("click", handleClick)
  });
  addSlideOut(questionOptions);
    setTimeout(() => document.querySelector(".question__text").classList.toggle("slideTextOut"), 1000);
    setTimeout(displayNextQuestion, 2000);
  };

  questionOptions.forEach((option, index) => {
    option.addEventListener("click", handleClick);
    addSlideIn(option, index);
  });

  startTimer(question, questionOptions);
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
  questionRunning = true;
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
// TIMER
/* ------------------------------------------------ */

function startTimer(question, questionOptions) {
  timer = baseTimer;
  const timerDiv = document.getElementById("timer")
  const progressBar = document.getElementById("barStatus");
  progressBar.style.width = "100%";

  setTimeout(() => {
    timerInterval = setInterval(progressTimer, 10);
    if(!questionRunning) clearInterval(timerInterval);

    function progressTimer() {
      if(timer >= 0) {
        timer -= 10;
        // console.log(Math.abs(timer/1000).toFixed(1));
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
    <h2 class="points">
      <div class="points__amount">${highScore}</div>
      <div class="points__unit">poäng</div>
    </h2>
    <div class="score">${correctAnswersAmount}/${questionAmount} rätt</div>

    <div class="button-container">
      <button id="resultButton" class="button result-button">
        <div class="button__text">Visa resultat</div>
        <i class="icon icon-check"></i>
      </button>

      <button class="button button--dark highscore-button" id="highscoreButton">
        <div class="button__text">Top 10 Highscores</div>
        <i class="icon icon-trophy"></i>
      </button>

      <button id="restartButton" class="button button restart-button">
        <div class="button__text">Kör en ny omgång</div>
        <i class="icon icon-restart"></i>
      </button>
    </div>
`;
  saveToLocalStorage(highScore, currentCategory);
}


/* ------------------------------------------------ */
// RESULTS & HIGHSCORE
/* ------------------------------------------------ */

function showResult() {
  const resultsContainer = document.createElement("div");
  resultsContainer.classList.add("result-list");

  let resultHTML = "<h2>Resultat</h2>";

    for(let i = 0; i < savedAnswers.length; i++){
      const result = savedAnswers[i];
      const isCorrect = result.selectedAnswer === result.correctAnswer;

        resultHTML += `
        <div class="result-item ${!isCorrect ? "result-item--wrong" : ""}">
          <div class="result-item__question-number">${i + 1}</div>
          <div class="result-item__question-text">${result.questionText}</div>
          <div class="result-item__selected-answer" style="${isCorrect ? "grid-row:span 2":""}">${result.selectedAnswer}</div>
          <div class="result-item__correct-answer ${!isCorrect ? "" : "hidden"}"><span class="underline">Korrekt svar:</span> ${result.correctAnswer}</div>
          <div class="result-item__icon"><i class="${!isCorrect ? "icon-close" : "icon-check"}"></i></div>
        </div>
        `;
      };

    resultsContainer.innerHTML = resultHTML;

    // Show in modal on mobile:
    openModal();
    dialogContent.appendChild(resultsContainer);
    // TODO: On desktop, show on page
}

function showHighscore() {
  const highscoreData = getHighscoreData();

  const highscoreContainer = document.createElement("div");
  highscoreContainer.classList.add("highscore-container");

  let highscoreHTML = "<h2>Highscore</h2>";

  if (highscoreData) {
    for (let i = 0; i < highscoreData.length; i++) {
      const highscore= highscoreData[i];
      highscoreHTML += `
        <div class="highscore">
          <div class="highscore__score">${i + 1}. ${highscore.highscore}p</div>
          <div class="highscore__date">${highscore.date}</div>
          <i class="${findCategoryByName(highscore.category)?.icon}"></i>
        </div>
      `;
    };
  }
  highscoreContainer.innerHTML = highscoreHTML;

  // Show in modal on mobile:
  openModal();
  dialogContent.appendChild(highscoreContainer);
  // TODO: On desktop, show on page
}

function openModal() {
  dialogContent.innerHTML = "";
  dialog.classList.add("grow");
  setTimeout(() => dialog.classList.remove("grow"), 500);
  dialog.showModal();
}

function closeModal() {
  dialog.classList.add("shrink");
  setTimeout(() => {
    dialog.close();
    dialog.classList.remove("shrink");
  }, 500);
}

/* ------------------------------------------------ */
// HELPER FUNCTIONS
/* ------------------------------------------------ */

function findCategoryByName(name) {
  return categories.find(category => category.name === name);
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
// EVENT DELEGATOR
/* ------------------------------------------------ */

document.body.addEventListener("click", (e) => {
  // Begin quiz when clicking the category
  if (e.target.closest(".category-button") || e.target.closest(".categories-mixed-button")?.getAttribute("data-id") === "Blandat") {
    quizApp.innerHTML = "";
    const chosenCategory = e.target.closest(".category-button")?.getAttribute("data-id") || "Blandat";
    selectedQuestions = generateQuestions(
      chosenCategory,
      questionAmount,
      allQuestions
    );

    currentCategory = chosenCategory;
    questionRunning = true;
    renderQuestionPage(newQuestion());

  } else if (e.target.closest("#restartButton")) {
    renderStartPage();
  } else if (e.target.closest("#highscoreButton")) {
    showHighscore();
  } else if (e.target.closest("#closeModalButton")) {
    closeModal();
  } else if (e.target.closest("#resultButton")) {
    showResult();
  }
});

/* ------------------------------------------------ */
// RUN INITIAL CODE
/* ------------------------------------------------ */

renderStartPage();
allQuestions = await parseQuestions(questionsFile);