'use strict';

function StartPage(){
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
    document.body.appendChild(startPage);
}
StartPage()