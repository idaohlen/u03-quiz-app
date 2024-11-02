'use strict';

function StartPage(){
    //Head container for the startpage
    const startPage = document.createElement('div');
    startPage.id = 'startpage'; 

    //Container for the quiz-titel
    const container=document.createElement('container');
    container.id='container';
    container.classList.add("container"); 

    const title=document.createElement('h1');
    title.textContent ='Quiz'; 
    container.appendChild(title);

    const buttonContainer = document.createElement("div");
    buttonContainer.id = "button-container";
    
    const categories = ["Djur", "Sport", "Musik"];
    categories.forEach(category => {
        const categoryButton = document.createElement("button");
        categoryButton.id = "button-container__button";
        categoryButton.textContent = category;
        buttonContainer.appendChild(categoryButton);
    });

    const startButtonContainer = document.createElement("div");
    startButtonContainer.className = "button-container";
    const startButton = document.createElement("button");
    startButton.id = "button-container__start";
    startButton.className = "button-container__start";
    startButton.textContent = "Start";
    startButtonContainer.appendChild(startButton);

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
    const highscoreData = [
        { score: "10p", date: "10/4/2024" },
        { score: "10p", date: "10/4/2024" }
    ];

    highscoreTable.appendChild(table);
    highscoreSection.appendChild(highscoreTable);
    startPage.appendChild(highscoreSection);

// Add the startPage div to body
    document.body.appendChild(startPage);
}
StartPage()