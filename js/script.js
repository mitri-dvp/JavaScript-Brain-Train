// GAME
class Game {
  constructor(operator, answers, result, ui, last, score, limit, timer) {
    this.operator = operator;
    this.answers = answers;
    this.result = result;
    this.ui = ui;
    this.last = last;
    this.scoreSpan = score;
    this.score = 0;
    this.limit = limit;
    this.correctAnswer = '';
    this.playing = true;
    if (localStorage.getItem('leaderBoard')) {
      this.leaderBoard = JSON.parse(localStorage.getItem('leaderBoard'));
    } else {
      this.leaderBoard = [];
    }
    this.resetValues();
    this.startCountdown();
  }

  startCountdown() {
    this.interval = setInterval(() => {
      timer.textContent = parseInt(timer.textContent) - 1;
      if (timer.textContent < 0) {
        timer.textContent = '0';
        clearInterval(this.interval);
        this.playing = false;
        this.displayGameOver();
      }
    }, 1000);
  }

  displayGameOver() {
    ding_sfx.currentTime = 0
    ding_sfx.play()
    const gameOver = document.createElement('form');
    gameOver.classList.add('game-over');
    gameOver.innerHTML = `
    <div class="enter-name">
      <h2>GAME OVER</h2>
      <h3>Enter your name!</h3>
      <input type="text">
      <div class='options'>
        <h3 class="change">Change Difficulty</h3>
        <h3 class="retry">Retry</h3>
      </div>
    </div>`;
    document.body.appendChild(gameOver);
    document.body.querySelector('.change').addEventListener('click', ()=> {this.changeDifficulty()})
    document.body.querySelector('.retry').addEventListener('click', ()=> {this.startGame()})
    gameOver.addEventListener('submit', e => {
      // LeaderBoard
      e.preventDefault();
      this.leaderBoard.push({
        name: gameOver.querySelector('input').value,
        score: this.score,
        speed: Math.floor((this.score / 30) * 100) / 100
      });
      this.leaderBoardSorted = this.leaderBoard.sort((a, b) => (a.score > b.score ? -1 : 1));
      localStorage.setItem('leaderBoard', JSON.stringify(this.leaderBoard));
      gameOver.innerHTML = `
      <div class='leaderboard'>
        <h1>Leader Board</h1>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Score</th>
              <th>Speed</th>
            </tr>
          </thead>
          <tbody>
          </tbody>
        </table>
        <div class='options'>
          <h3 class="change">Change</h3>
          <h3 class="retry">Retry</h3>
        </div>
       </div>
       `;
      this.leaderBoardSorted.forEach((e, i) => {
        if (i > 4) {
          return 0;
        }
        gameOver.querySelector('tbody').innerHTML += `
          <tr>
            <td>${e.name}</td>
            <td>${e.score}</td>
            <td>${e.speed} a/s</td>
          </tr>`;
      });
      // RESET
      gameOver.addEventListener('click', e => {
        if (e.target.className.match('change')) {
          this.changeDifficulty()
        }
        if (e.target.className.match('retry')) {
          this.startGame()
        }
      });
    });
  }

  resetValues() {
    if (this.playing) {
      setTimeout(() => {
        this.answers.forEach(answer => {
          answer.value = null;
          answer.disabled = false;
        });
        this.displayQuestion();
      }, 0);
    } else {
      clearInterval(this.countdown);
    }
  }

  displayQuestion() {
    form.style.visibility = 'hidden';
    // Select Operator
    this.operator.innerHTML = operators[Math.floor(Math.random() * operators.length)];
    // Select Disable
    const a = [Math.floor(Math.random() * this.limit)];
    const i = [Math.floor(Math.random() * 2)];
    this.disabled = this.answers[i];
    if (this.operator.innerHTML === '÷' || this.operator.innerHTML === 'x') {
      const n = [Math.floor(Math.random() * this.limit) + 1];
      this.disabled.value = n;
    } else {
      const n = [Math.floor(Math.random() * this.limit)];
      this.disabled.value = n;
    }
    this.disabled.disabled = true;
    this.result.value = a;
    this.answers.forEach((answer, i) => {
      if (answer != this.disabled) {
        this.answer = answer;
        this.answerIndex = i;
      }
    });
    this.checkQuestion();
  }

  checkQuestion() {
    const disabledValue = parseFloat(this.disabled.value);
    if (this.answerIndex == 0) {
      switch (this.operator.innerHTML) {
        case '+':
          this.correctAnswer = this.result.value - disabledValue;
          break;
        case '-':
          this.correctAnswer = parseFloat(this.result.value) + disabledValue;
          break;
        case 'x':
          this.correctAnswer = Math.floor((this.result.value / disabledValue) * 100) / 100;
          break;
        case '÷':
          this.correctAnswer = Math.floor(disabledValue * this.result.value * 100) / 100;
          break;
        default:
          return '';
      }
    } else {
      switch (this.operator.innerHTML) {
        case '+':
          this.correctAnswer = this.result.value - disabledValue;
          break;
        case '-':
          this.correctAnswer = (this.result.value - disabledValue) * -1;
          break;
        case 'x':
          this.correctAnswer = Math.round((this.result.value / disabledValue) * 100) / 100;
          break;
        case '÷':
          this.correctAnswer = Math.floor((disabledValue / this.result.value) * 100) / 100;
          break;
        default:
          return '';
      }
    }
    if (this.correctAnswer == Infinity) {
      this.resetValues();
      return;
    }
    if (hard) {
      form.style.visibility = 'visible';
      this.answer.focus();
    } else if (this.correctAnswer < 0 || this.correctAnswer % 1 > 0 || this.correctAnswer == 0) {
      this.resetValues();
      return;
    }
    form.style.visibility = 'visible';

    this.answer.focus();
  }

  checkAnswer(answer) {
    if (!this.playing) {
      return;
    }
    const answerValue = parseFloat(answer);
    const prevQuestion = questionDiv.cloneNode(true);
    prevQuestion.querySelectorAll('.answers').forEach(child => {
      if (!child.disabled) {
        child.classList.add('answered');
        child.disabled = true;
      }
    });
    if (answerValue == this.correctAnswer) {
      correct_sfx.currentTime = 0
      correct_sfx.play()
      prevQuestion.classList.add('correct');
      prevousQDiv.append(prevQuestion);
      this.resetValues();
      this.ui.parentElement.classList.remove('wrong');
      this.ui.parentElement.classList.add('correct');
      this.ui.innerHTML = 'Correct!';
      this.score++;
      this.scoreSpan.innerHTML = this.score;
      this.last.innerHTML = '';
    } else {
      wrong_sfx.currentTime = 0
      wrong_sfx.play()
      prevQuestion.classList.add('wrong');
      prevousQDiv.append(prevQuestion);
      this.resetValues();
      this.ui.parentElement.classList.remove('correct');
      this.ui.parentElement.classList.add('wrong');
      this.ui.innerHTML = 'Wrong!';
      this.last.innerHTML = `Correct answer was: ${this.correctAnswer}`;
    }
    [...prevousQDiv.children].forEach((child, i) => {
      if (i > 2) {
        prevousQDiv.firstElementChild.remove();
      }
    });
  }

  resetGame() {
    document.body.querySelector('.game-over')?.remove();
    this.score = 0;
    this.scoreSpan.innerHTML = this.score;
    timer.textContent = 30;
    this.ui.parentElement.classList.remove('wrong');
    this.ui.parentElement.classList.remove('correct');
    [...prevousQDiv.children].forEach(child => {
      prevousQDiv.firstElementChild.remove();
    });
  }
  changeDifficulty() {
    select_sfx.currentTime = 0
    select_sfx.play()
    modal.classList.remove('hide')
    this.resetGame()
  }
  startGame() {
    select_sfx.currentTime = 0
    select_sfx.play()
    this.resetGame()
    this.playing = true;
    this.startCountdown();
    this.resetValues();
  }
}

// Elements
let operators = ['+', '-', 'x', '÷'];
const operator = document.querySelector('.operator');
const form = document.querySelector('.math-game');
const answers = document.querySelectorAll('.answers');
const result = document.querySelector('.result');
const ui = document.querySelector('.ui-answer');
const last = document.querySelector('.last-answer');
const score = document.querySelector('.score span');
const questionDiv = document.querySelector('.question');
const prevousQDiv = document.querySelector('.previous-results');
const timer = document.querySelector('.timer');
const help = document.querySelector('.help');
const instructions = document.querySelector('.instructions');
const exitInstructions = document.querySelector('.exit-instructions');
let limit = 10;
let game;
let hard = false;
// Modal
const modal = document.querySelector('.modal');
// Sounds
const correct_sfx = new Audio('./css/sounds/correct.mp3');
const wrong_sfx = new Audio('./css/sounds/wrong.mp3');
const select_sfx = new Audio('./css/sounds/select.mp3');
const ding_sfx = new Audio('./css/sounds/ding.mp3');

// Event listeners
form.addEventListener('submit', answer);
function answer(e) {
  e.preventDefault();
  answers.forEach(answer => {
    if (!answer.disabled) {
      game.checkAnswer(answer.value);
    }
  });
}

help.addEventListener('click', showInstructions)
function showInstructions() {
  select_sfx.currentTime = 0
  select_sfx.play()
  instructions.classList.remove('hide')
}

exitInstructions.addEventListener('click', hideInstructions)
function hideInstructions() {
  select_sfx.currentTime = 0
  select_sfx.play()
  instructions.classList.add('hide')
}

modal.addEventListener('click', e => {
  e.preventDefault();
  const selection = e.target.className;
  switch (selection) {
    case 'e':
      operators = ['+', '-'];   
      hard = false;
      limit = 10; 
      break;
    case 'm':
      operators = ['+', '-', 'x', '÷'];      
      hard = false;
      limit = 10; 
      break;
    case 'h':
      operators = ['+', '-', 'x', '÷'];      
      hard = true;
      limit = 10; 
      break;
    case 'i':
      operators = ['+', '-', 'x', '÷'];     
      hard = true;
      limit = 99; 
      break;
  
    default:
      return
  }

  modal.classList.add('hide');
  select_sfx.currentTime = 0
  select_sfx.play()

  // Init game
  if(game) {
    game.limit = limit
    game.startGame()
  } else {

    game = new Game(operator, answers, result, ui, last, score, limit, timer);
  }
});
