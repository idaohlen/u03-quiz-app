const quizApp = document.getElementById("app");

let allQuestions;
let selectedQuestions;
const questionsFile = "./questionDataBase.questions.json";
const chosenCategory = "";
const questionAmount = 10;
const savedAnswers = [];

/* ------------------------------------------------ */
// START PAGE
/* ------------------------------------------------ */

function renderStartPage() {
  const categories = [
    {name: "Musik", icon: "icon-music"},
    {name: "TV & Film", icon: "icon-movies"},
    {name: "Litteratur", icon: "icon-literature"},
    {name: "Geografi", icon: "icon-world"},
    {name: "Historia", icon: "icon-hourglass"},
    {name: "Språk", icon: "icon-chat"},
  ];

  const highscoreData = JSON.parse(localStorage.getItem("Highscore"));

  console.log(highscoreData);
  // Create categories HTML
  let categoriesHTML = "";
  categories.forEach((category) => {
    categoriesHTML += `<button class="category-button" data-id="${category.name}">
    <i class="category-icon ${category.icon}"></i>
    ${category.name}
    </button>`;
  });

  // Create highscore HTML
  let highscoreHTML = "";
  if (highscoreData) {
    highscoreData.forEach((highscore) => {
      highscoreHTML += `
      <div class="highscore">
        <div class="highscore__score">Highscore ${highscore.highscore}</div>
        <div class="highscore__score">Highscore ${highscore.date}</div>
      </div>
    `;
    });
  }

  quizApp.innerHTML = `
    <h1>Quiz</h1>
    <div class="categories-container">
    ${categoriesHTML}
    <button class="categories-mixed-button" data-id="Blandat"><div class="categories-mixed-button__text">Blandade frågor</div> <i class="icon icon-shuffle"></i></button>
    </div>
    
    <div class="highscore-container">${highscoreHTML}</div>
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
  const answers = [question.correctAnswer, ...question.incorrectAnswers];
  shuffleArray(answers);

  let answersHTML = "";


  // Loop through the answers array and add an HTML element for each of them into the answersHTML variable
  for (let i = 0; i < answers.length; i++) {
    let answerLetter = "A";
    if (i === 1) answerLetter = "B";
    else if (i === 2) answerLetter = "C";

    answersHTML += `<div data-id="${question._id["$oid"]}" class="question__option">
      <div class="question__answer-letter">${answerLetter}</div>
      <div class="question__answer-text">${answers[i]}</div>
    </div>`;
  }

  // Add HTML content to the question wrapper
  questionWrapper.innerHTML = `
    <div id="questionText" class="question__text">${question.text}</div>
    <div id="optionsContainer" class="question__options-container">${answersHTML}</div>`;

  // Add the question wrapper div to the quiz app container
  quizApp.appendChild(questionWrapper);

  const questionOption = document.querySelectorAll(".question__option");
  questionOption.forEach((option) =>
    option.addEventListener("click", (e) => {
      saveAnswer(question, e.target.value, 10);
      displayNextQuestion();
    })
  );
}

function saveAnswer(question, answer, time) {
  const answerEntry = {
    questionText: question.text,
    correctAnswer: question.correctAnswer,
    selectedAnswer: answer,
    timeLeft: time,
  };
  savedAnswers.push(answerEntry);
}

function shuffleArray(array) {
  for (let i = array.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/* ------------------------------------------------ */
// END PAGE
/* ------------------------------------------------ */

function renderEndPage() {
  let correctAnswersAmount = 0;
  let resultHTML = "";
  let highScore = 0;

  savedAnswers.forEach((result) => {
    resultHTML += `<div class="result-list__item">${result.questionText}</div> 
    <div class="selected-answer">Ditt svar: ${result.selectedAnswer}</div>
    <div class="correct-answer">Korrekt svar: ${result.correctAnswer}</div>`;

    if (result.selectedAnswer === result.correctAnswer) {
      correctAnswersAmount++;
      highScore += calculateScore(result.timeLeft);
    }
  });

  quizApp.innerHTML = `
    <h1>Slutresultat</h1>
    <p id="showScore" class="show-score">${correctAnswersAmount} av ${questionAmount} rätt</p>
    <p class="high-score">Highscore ${highScore}🏆</p>
    <button id="resultButton" class="result-button">Visa resultat</button>
    <div id="resultContainer" class="result-list">${resultHTML}</div>
    <button id="restartButton" class="restart-button">Kör en ny omgång</button>
`;
  saveToLocalStorage(highScore);
}

function calculateScore(time) {
  return Math.ceil(time) + 5;
}

function saveToLocalStorage(highscore) {
  let currentHighscores = JSON.parse(localStorage.getItem("Highscore"));
  console.log(new Date().toLocaleString());
  const date = new Date().toLocaleString();

  if (currentHighscores) {
    const newEntry = {
      highscore: highscore,
      date: date,
    };
    currentHighscores.push(newEntry);
    localStorage.setItem("Highscore", JSON.stringify(currentHighscores));
  } else {
    const newEntry = {
      highscore: highscore,
      date: date,
    };
    const newHighscores = [];
    newHighscores.push(newEntry);
    localStorage.setItem("Highscore", JSON.stringify(newHighscores));
  }
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
// EVENT DELEGATOR

/* ------------------------------------------------ */

document.body.addEventListener("click", (e) => {
  // Begin quiz when clicking the category
  if (e.target.className === "category-button" ||
    e.target.getAttribute("data-id") === "Blandat") {
    quizApp.innerHTML = "";
    selectedQuestions = generateQuestions(
      e.target.getAttribute("data-id"),
      questionAmount,
      allQuestions
    );

    renderQuestionPage(newQuestion());
  } else if (e.target.id === "restartButton") {
    renderStartPage();
  }
});

/* ------------------------------------------------ */
// RUN INITIAL CODE
/* ------------------------------------------------ */

renderStartPage();
allQuestions = await parseQuestions(questionsFile);
