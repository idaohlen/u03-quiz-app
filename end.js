'use strict';

function displayEndPage () {
    const main = document.createElement('main');
    main.className = 'result-main';

    const header = document.createElement('header');
    header.className = 'result-header';
    main.appendChild(header);

    const h1 = document.createElement('h1');
    h1.textContent = 'Slutresultat';
    header.appendChild(h1);

    const paragraph = document.createElement('p');
    paragraph.textContent = '10 av 10 rätt!';
    paragraph.id = 'showScore';
    paragraph.className = 'show-score';
    header.appendChild(paragraph);

    const resultBtn = document.createElement('button');
    resultBtn.textContent = 'Visa resultat';
    resultBtn.id = 'resultBtn';
    resultBtn.className = 'result-btn'
    header.appendChild(resultBtn);











    
    
}
displayEndPage()