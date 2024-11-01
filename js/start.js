'use strict';

const startpage = document.getElementById("startpage");

function createStartPage(){

    //Head container for the startpage
    const startPage = document.createElement('startpage');
    startPage.id = 'startpage';

    //Container for the quiz-titel
    const container=dokcument.createElement('container');
    container.id='container';
    container.className ='container';

    const title=document.createElement('h1');
    title.textContent ='Quiz'; 
    container.appendChild(title);

    function createButtonContainer() {
        // Create button-container 
        const buttonContainer = document.createElement('buttoncontainer');
        buttonContainer.id = 'button-container';
        buttonContainer.className = 'button-container';
    
        // List with buttontext
        const buttonTexts = ['Djur', 'Sport', 'Musik'];
    
        // Create buttons based on the list
        buttonTexts.forEach(text => {
            const button = document.createElement('button');
            button.id = 'button-container__button';
            button.className = 'button-container__button';
            button.textContent = text; 
            buttonContainer.appendChild(button); // Add the button to the button container
        });
    
        document.body.appendChild(buttonContainer);
    }
}