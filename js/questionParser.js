document.addEventListener("DOMContentLoaded", function() {
    const questionsFile = "./questionDataBase.questions.json"
    const chosenCategory = "Historia";
    const questionAmount = 10;
    let questionsList;

    parseQuestions(questionsFile).then(allQuestions => {
        questionsList = allQuestions;
    });

    /* Placeholder code snippet to trigger generation of questions */ 
    const startButton = document.querySelector(".button-container__start");

    startButton.addEventListener("click", () => {
        const questionList = generateQuestions(chosenCategory, questionAmount, questionsList)
        console.log(questionList)
    })

});

const parseQuestions = async (fileName) => {
    const fileContent = await (await fetch(fileName)).text()
    const allQuestions = JSON.parse(fileContent)
    return allQuestions
}

const generateQuestions = (category, amount, questionList) => {
    const categoryQuestions = questionList.filter(question => question.tags.includes(category))

    if(categoryQuestions.length < amount) throw new Error(`Not enough questions for category "${category}" in the JSON file`);
    let generatedQuestions = []
    while(generatedQuestions.length < amount)
        {
            generatedQuestions.push(categoryQuestions.splice(Math.floor(Math.random() * categoryQuestions.length), 1)[0])
        }
    return generatedQuestions;
}