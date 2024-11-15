export function calculateScore(time) {
  return Math.ceil(time) + 5;
}

export function shuffleArray(array) {
  let shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

//TODO: MAKE PURE?
export function saveToLocalStorage(highscore, currentCategory) {
  let currentHighscores = JSON.parse(localStorage.getItem("Highscore"));
  const date = new Date().toLocaleString();
  console.log(currentCategory);

  if (currentHighscores) {
    const newEntry = {
      highscore: highscore,
      date: date,
      category: currentCategory,
    };
    currentHighscores.push(newEntry);
    localStorage.setItem("Highscore", JSON.stringify(currentHighscores));
  } else {
    const newEntry = {
      highscore: highscore,
      date: date,
      category: currentCategory,
    };
    const newHighscores = [];
    newHighscores.push(newEntry);
    localStorage.setItem("Highscore", JSON.stringify(newHighscores));
  }
}

export function saveAnswer(question, answer, time) {
  const answerEntry = {
    questionText: question.text,
    correctAnswer: question.correctAnswer,
    selectedAnswer: answer,
    timeLeft: time,
  };
  return answerEntry;
}

export function getHighscoreData() {
  const savedHsData = JSON.parse(localStorage.getItem("Highscore")) || [];
  
  const sortedData = savedHsData.sort((a, b) => b.highscore - a.highscore);

  return sortedData.slice(0, 5);
}
