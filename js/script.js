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

const mixCategory = {name: "Blandat", icon: "icon-shuffle", class: "category-mix"}

let allQuestions;
let selectedQuestions;
const questionsFile = "./questionDataBase.questions.json";
const questionAmount = 10;
const savedAnswers = [];

let timerInterval;
let timer;
const baseTimer = 10000;

let correctAnswersAmount = 0;
let highScore = 0;

let playing = false;
let currentCategory;


/* ------------------------------------------------ */
// START PAGE
/* ------------------------------------------------ */

function renderStartPage() {

  // Resets saved answer object and current highscore/correct answer count
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
    <div class="start-page__title">${createTitle()}</div>

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

function createTitle() {
  return `
      <hgroup class="title">
        <h1 class="title__heading">QuizMix</h1>
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
  const questionNumber = questionAmount - selectedQuestions.length

  // Put correct answer + incorrect answers into an array and shuffle display order of options
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
    <div class="title question__title">${createTitle()}</div>

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
  
      <div id="questionCounter" class="question__question-counter">
        <div class="question_counter-fill">${questionNumber}</div>
      </div>
    `;

  // Add the question wrapper div to the quiz app container
  quizApp.appendChild(questionWrapper);

  const questionOptions = document.querySelectorAll(".question__option");
  const questionCounter = document.getElementById("questionCounter");

  const procentFilled = (questionNumber/questionAmount * 100)
  questionCounter.style.setProperty('background-image', `conic-gradient(var(--category-color-2) ${procentFilled}%, white 1%)`);

  const handleClick = (e) => {
    clearInterval(timerInterval);

    savedAnswers.push(
      saveAnswer(
        question,
        e.target.closest(".question__option").getAttribute("data-answer"),
        timer / 1000
      )
    );
    questionOptions.forEach((o) => {
      o.removeEventListener("click", handleClick);
    });
    addSlideOut(questionOptions);
    setTimeout(
      () =>
        document
          .querySelector(".question__text")
          .classList.toggle("slideTextOut"),
      1000
    );
    setTimeout(displayNextQuestion, 2000);
  };


  questionOptions.forEach((option, index) => {

    //Adds click event after 1.5s to each option to prevent clicking while the option is sliding in
    setTimeout(() => option.addEventListener("click", handleClick), 1500);

    //Adds slide in animation to each question option with increasing delay
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
  if (currentQuestion) {
    quizApp.removeChild(currentQuestion);
  }
  const nextQuestion = newQuestion();
  if (nextQuestion) {
    renderQuestionPage(nextQuestion);
  } else {
    // No more questions, show the end page
    const fadeTime = 400;
    fadeOut(quizApp, fadeTime);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      fadeIn(quizApp, fadeTime);
      renderEndPage();
    }, fadeTime + 200);
  }
}


/* ------------------------------------------------ */
// TIMER
/* ------------------------------------------------ */

function startTimer(question, questionOptions) {

  //Resets timer to base timer value
  timer = baseTimer;
  const timerDiv = document.getElementById("timer")
  const progressBar = document.getElementById("barStatus");
  progressBar.style.width = "100%";

  setTimeout(() => {

    //Start timerInterval and run progressTimer function every 10 millisecond
    timerInterval = setInterval(progressTimer, 10);

    //Function to progress imer and decrease timer variable by 10
    function progressTimer() {
      if(timer >= 0) {
        timer -= 10;


        timerDiv.innerHTML = Math.abs(timer/1000).toFixed(1);
        progressBar.style.width = (timer/100) + "%";
      }
      else {

        //If timer is < 0 the user didnt choose an answer in time so we save a pass answer to the save answers object and progress to next question
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
  playing = false;
  const endPageWrapper = document.createElement("div");
  endPageWrapper.classList.add("end-page");

  savedAnswers.forEach((result) => {
    if (result.selectedAnswer === result.correctAnswer) {
      correctAnswersAmount++;
      highScore += calculateScore(result.timeLeft);
    }
  });

  const newHighscore = saveToLocalStorage(highScore, currentCategory);
  const highscores = getHighscoreData();
  const findHighscore = highscores.findIndex(x => x.date === newHighscore.date);

  let highscoreDate = newHighscore.date;
  let highscoreHighlights = "";
  let startIndex = 0;

  // Highscore highlights on desktop
  if (findHighscore < 0) {
    // Didn't make top 10, show the top 3
    highscoreDate = null;
    highscoreHighlights = highscores.slice(0, 3);
  } else if (findHighscore === 0) {
    // First place in highscore
    highscoreHighlights = highscores.slice(0, 3);
  } else if (findHighscore === highscores.length) {
    // Last place in highscore
    startIndex = 7;
    highscoreHighlights = highscores.slice(-3);
  } else if (highscores.length <= 3) {
    // If there are 3 or less highscores, show them all
    startIndex = 0;
    highscoreHighlights = highscores;
  } 
  else {
    startIndex = findHighscore - 1;
    highscoreHighlights = [highscores[findHighscore - 1], newHighscore, highscores[findHighscore + 1]];
  }

  endPageWrapper.innerHTML = `
    <div class="end-page__title">${createTitle()}</div>

    <div class="end-page__points">
      <h2 class="points">
        <div class="points__amount">${highScore}</div>
        <div class="points__unit">poäng</div>
        ${findHighscore > -1 ? `<div class="points__highscore-marker title="Highscore!"><i class="icon icon-trophy"></i></div>` : ""}
      </h2>
      <div class="score">${correctAnswersAmount}/${questionAmount} rätt</div>
    </div>

    <div class="end-page__results">
      <h2 class="result-title">Resultat</h2>
      ${renderResult()}
    </div>

    <div class="bottom-container">
      <div class="highscore-highlights">
        ${renderHighscore(highscoreHighlights, startIndex, highscoreDate)}
      </div>

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
  quizApp.appendChild(endPageWrapper);
}


/* ------------------------------------------------ */
// RESULTS & HIGHSCORE
/* ------------------------------------------------ */

function renderResult() {
  let resultHTML = "";

  savedAnswers.forEach((result, i) => {
    const isCorrect = result.selectedAnswer === result.correctAnswer;

      resultHTML += `
        <div class="result-item ${!isCorrect ? "result-item--wrong" : ""}">
          <div class="result-item__question-number">${i + 1}</div>
          <div class="result-item__answer">
            <div class="result-item__correct-answer">${result.correctAnswer}</div>
            <div class="result-item__selected-answer ${!isCorrect ? "" : "hidden"}"><span class="result-item__selected-answer-label underline">Ditt svar: </span> ${result.selectedAnswer}</div>
          </div>

          <div class="result-item__icon"><i class="${!isCorrect ? "icon-close" : "icon-check"}"></i></div>
          <div class="result-item__arrow"><i class="icon icon--arrow-down"></i></div>
          <div class="result-item__question-text">${result.questionText}</div>
        </div>
        
      `;
    });

    const resultsContainer = `
      <div class="result-list">
        ${resultHTML}
      </div>
    `;

    return resultsContainer;
}

function showResult() {
  openModal();
  dialogContent.innerHTML = `
    <h2 class="result-title">Resultat</h2>
    ${renderResult()}
  `;

  const resultItems = document.querySelectorAll(".result-item") 
  resultItems.forEach((resultItem) => {
    resultItem.addEventListener("click", (e) => {
      
      const clickedResultItemId = (e.target.closest(".result-item").id).split("-").slice(-1);
      const resultItemTexts = document.querySelectorAll(`#result-text-${clickedResultItemId}`)
      const resultArrowIcons = document.querySelectorAll(`#result-arrow-${clickedResultItemId}`)
      resultArrowIcons.forEach(resultArrow => {
        resultArrow.classList.toggle("icon--arrow-up");
        resultArrow.classList.toggle("icon--arrow-down");
      })
      resultItemTexts.forEach(resultItem => resultItem.style.display = resultItem.style.display !== "block" ? "block" : "none");
    })
  })

}

function renderHighscore(data, startIndex = 0, highscoreDate = null) {
  let html = "";
  data.forEach((highscore, i) => {
    const dateFormatted = highscore.date.split(" ");

    const dateHTML = `<span>${dateFormatted[0]}</span> <span class="highscore__time">${dateFormatted[1]}</span>`;

    html += `
      <div class="highscore ${highscoreDate === highscore.date ? "highscore__highlight" : ""}">
        <div class="highscore__score">${startIndex + i + 1}. ${highscore.highscore}p</div>
        <div class="highscore__date">${dateHTML}</div>
        <div class="highscore__icon ${findCategoryByName(highscore.category)?.class}" title="${highscore.category}">
          <i class="icon ${findCategoryByName(highscore.category)?.icon}"></i>
        </div>
      </div>
    `;
  });

  return html;
}

function showHighscore() {
  //Retrieves the highscore data from localstorage
  const highscoreData = getHighscoreData();

  const highscoreContainer = document.createElement("div");
  highscoreContainer.classList.add("highscore-container");

  let highscoreHTML = `
    <h2>Highscore</h2>
    <p>Inga highscores har registrerats.</p>
  `;

  if (highscoreData.length > 0) {
    highscoreHTML = `
      <h2>Highscore</h2>
        ${renderHighscore(highscoreData)}
    `;
  }

  highscoreContainer.innerHTML = highscoreHTML;

  openModal();
  dialogContent.appendChild(highscoreContainer);
}

function openModal() {
  dialogContent.innerHTML = "";

  //Add grow transition and removes after a certain amount
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
  const categoryFound = categories.find(category => category.name === name);
  if (categoryFound) return categoryFound;
  else return mixCategory;
}

//Fade out transition used for transition between home page and question
function fadeOut(el, time) {
  el.classList.add("fadeOut");
  el.style.animationDuration = time + "ms";
  setTimeout(() => el.classList.remove("fadeOut"), time);
}

function fadeIn(el, time) {
  el.classList.add("fadeIn");
  el.style.animationDuration = time + "ms";
  setTimeout(() => el.classList.remove("fadeIn"), time);
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

    //Return all questions that has a certain tag
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

  //Adds questions for the selected category until we have enough questions
  while (generatedQuestions.length < amount) {

    //Push a spliced question from a randomly generated index in the array of possible questions
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
    if (playing) return;

    playing = true;

    const fadeTime = 400;
    fadeOut(quizApp, fadeTime);

    const chosenCategory = e.target.closest(".category-button")?.getAttribute("data-id") || "Blandat";
    selectedQuestions = generateQuestions(
      chosenCategory,
      questionAmount,
      allQuestions
    );

    currentCategory = chosenCategory;

    setTimeout(() => {
      quizApp.innerHTML = "";
      renderQuestionPage(newQuestion());
      fadeIn(quizApp, fadeTime);
    }, fadeTime);
  } else if (e.target.closest("#restartButton")) {
    renderStartPage();
  } else if (e.target.closest("#highscoreButton")) {
    showHighscore();
  } else if (e.target.closest("#closeModalButton")) {
    closeModal();
  } else if (e.target.closest("#resultButton")) {
    showResult();
  } else if (e.target.closest(".result-item")) {
    // Show/hide question when viewing results
    const resultItem = e.target.closest(".result-item");

    const resultItemText = resultItem.querySelector(".result-item__question-text");
    const resultArrowIcon = resultItem.querySelector(".result-item__arrow .icon");

    resultArrowIcon.classList.toggle("icon--arrow-up");
    resultArrowIcon.classList.toggle("icon--arrow-down");

    const questionIsVisible = resultItemText.style.display === "block";

    resultItemText.style.display = questionIsVisible ? "none" : "block";

  }
});


/* ------------------------------------------------ */
// RUN INITIAL CODE
/* ------------------------------------------------ */

renderStartPage();

//Async function to parse the question json and create the array of possible questions
allQuestions = await parseQuestions(questionsFile);