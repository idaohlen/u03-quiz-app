const quizApp = document.getElementById("app");

let allQuestions;
let selectedQuestions;
let questionsAnswers = [];
const questionsFile = "./questionDataBase.questions.json";
const chosenCategory = "";
const questionAmount = 10;
const savedAnswers = [];

/* ------------------------------------------------ */
// START PAGE
/* ------------------------------------------------ */

function renderStartPage() {
  const categories = ["Blandat", "Sport", "Musik"];

  const highscoreData = [
    { score: "10p", date: "10/4/2024" },
    { score: "10p", date: "10/4/2024" },
  ];

  // Create categories HTML
  let categoriesHTML = "";
  categories.forEach((category) => {
    categoriesHTML += `<button class="category-button">${category}</button>`;
  });

  // Create highscore HTML
  let highscoreHTML = "";
  highscoreData.forEach((highscore) => {
    highscoreHTML += `
      <div class="highscore">
        <div class="highscore__score">${highscore.score}</div>
        <div class="highscore__date">${highscore.date}</div>
      </div>
    `;
  });

  quizApp.innerHTML = `
    <h1>Quiz</h1>
    <div class="categories-container">${categoriesHTML}</div>
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
    answersHTML += `<input type="button" data-id="${question._id["$oid"]}" class="question__option"value="${answers[i]}">`;
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
  const results = [
    "Fråga 1",
    "Fråga 2",
    "Fråga 3",
    "Fråga 4",
    "Fråga 5",
    "Fråga 6",
    "Fråga 7",
    "Fråga 8",
    "Fråga 9",
    "Fråga 10",
  ];

  let resultHTML = "";
  console.log(questionsAnswers);
  questionsAnswers.forEach((result) => {
    resultHTML += `<div class="result-list__item">${result.text}</div>`;
  });

  quizApp.innerHTML = `
    <h1>Slutresultat</h1>
    <p id="showScore" class="show-score">10 av 10 rätt!</p>
    <button id="resultButton" class="result-button">Visa resultat</button>
    <div id="resultContainer" class="result-list">${resultHTML}</div>
    <button id="restartButton" class="restart-button">Kör en ny omgång</button>
`;
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
  if (e.target.className === "category-button") {
    quizApp.innerHTML = "";
    selectedQuestions = generateQuestions(
      e.target.innerHTML,
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
