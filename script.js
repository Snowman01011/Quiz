// Variables
let questions = [];
let currentIndex = 0;
let timerInterval = null;
let timeLeft = 60; // seconds per question
let timerPaused = false;

// DOM elements
const quesText = document.getElementById('quesText');
const optionButtons = document.querySelectorAll('.opt');
const progressFill = document.getElementById('progressFill');
const questionInfo = document.getElementById('questionInfo');
const nextBtn = document.getElementById('nextBtn');
const timerDisplay = document.getElementById('timer');
const pauseBtn = document.getElementById('pauseBtn');


//sounds
const correctSound = new Audio('/sounds/correct.mp3');
const wrongSound = new Audio('/sounds/wrong.mp3');

// Disable next button initially
nextBtn.disabled = true;
function loadProfileCardsPage() {
  fetch('profile.html')
    .then(res => res.text())
    .then(html => {
        document.body.innerHTML = html;
    })
    .catch(err => console.error("Error loading profile page:", err));
}

// Load questions from JSON file
async function loadQuestions() {
    try {
        const response = await fetch('/src/config.json'); // adjust path if needed
        questions = await response.json();
        showQuestion();
        startTimer();
    } catch (error) {
        console.error('Failed to load questions:', error);
    }
}

// Show current question and options
function showQuestion() {
    resetState();

    const q = questions[currentIndex];
    quesText.textContent = q.question;
    questionInfo.textContent = `Question ${currentIndex + 1} of ${questions.length}`;

    const progressPercent = ((currentIndex) / questions.length) * 100;
    progressFill.style.width = `${progressPercent}%`;

  optionButtons.forEach((btn, index) => {
        btn.textContent = q.options[index];
        btn.disabled = false;
        btn.style.backgroundColor = '';
        quesText.style.backgroundColor = ''; // reset colors

    btn.onclick = () => {
      // Disable all options after selection
      optionButtons.forEach(b => b.disabled = true);

      if (btn.textContent === q.answer) {
            btn.style.backgroundColor = '#28a745'; // green for correct
            nextBtn.disabled = false;
            stopTimer();
            showPop("Correct answer!", 0);
            correctSound.play();
      } else {
        btn.style.backgroundColor = '#dc3545'; // red for wrong
        showPop("Incorrect answer!", 1);
            optionButtons.forEach(b => {
            if (b.textContent === q.answer) {
                b.style.backgroundColor = '#28a745'; // show correct
            }
        });
        nextBtn.disabled = false;
        stopTimer();
        wrongSound.play();
      }
    };
  });
}

function showPop(msg, num){
    quesText.textContent = msg;
    if(num == 0){
        quesText.style.backgroundColor = '#28a745';
    } else {
        quesText.style.backgroundColor = '#dc3545';
    }
}


// Reset state before showing a new question
function resetState() {
    nextBtn.disabled = true;
    clearInterval(timerInterval);
    timeLeft = 60;
    timerDisplay.textContent = formatTime(timeLeft);
}

// Timer logic
function startTimer() {
    timerInterval = setInterval(() => {
        if (!timerPaused) {
        timeLeft--;
        timerDisplay.textContent = formatTime(timeLeft);
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                const correctAnswer = questions[currentIndex].answer;

                optionButtons.forEach(btn => {
                    btn.disabled = true;
                    if (btn.textContent === correctAnswer) {
                        btn.style.backgroundColor = '#28a745'; // show correct in green
                    } else {
                        btn.style.backgroundColor = '#dc3545'; // wrong ones turn red
                    }
                });

                nextBtn.disabled = false;
            }
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
}

function formatTime(seconds) {
    return seconds < 10 ? `0${seconds}` : seconds;
}

// Next question
function nextQuestion() {
    currentIndex++;
    if (currentIndex < questions.length) {
        showQuestion();
        startTimer();
    } else {
        showResults();
    }
}

// Pause button
pauseBtn.onclick = () => {
  timerPaused = !timerPaused;
  pauseBtn.textContent = timerPaused ? 'Resume Time' : 'Pause Time';
  timeupSound.pause();
};

// Show final results
function showResults() {
    progressFill.style.width = '100%';
    questionInfo.textContent = 'Quiz Complete!';
    quesText.textContent = 'Thank You';

    optionButtons.forEach(btn => btn.style.display = 'none');
    nextBtn.style.display = 'none';
    timerDisplay.style.display = 'none';
    pauseBtn.style.display = 'none';
    setTimeout(()=>{
         goToProfilePage();
    }, 3000)
}

function goToProfilePage() {
  window.location.href = "profile.html"; // Your profile cards page
}
loadQuestions();
