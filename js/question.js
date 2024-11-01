const quizApp = document.getElementById("quizApp");

// Dummy question data
const questionsData = [
  {
    "_id": {
      "$oid": "667a80b79f5f94550435091b"
    },
    "text": "Vem var det som målade Nattvakten?",
    "correctAnswer": "Rembrandt van Rijn",
    "incorrectAnswers": [
      "Hieronymus Bosch",
      "Johannes Vermeer"
    ],
    "tags": ["Konst"]
  }
];

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

    // Add the question wrapper div to the quiz app main container
    quizApp.appendChild(questionWrapper);
}

renderQuestionPage(questionsData[0]);