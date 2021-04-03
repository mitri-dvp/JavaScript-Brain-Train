// Game
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
    const gameOver = document.createElement('form');
    gameOver.classList.add('game-over');
    gameOver.innerHTML = `
    <div>
      <h1>Game Over</h1>
      <h1>Enter Your Name!</h1>
      <input type="text">
    </div>`;
  //   <div class="enterName">
  //     <h2>GAME OVER</h2>
  //     <h3>Enter your name!</h3><br>
  //     <input type="text">
  //     <h3 class="retry">Retry?</h3><br>
  // </div>
    document.body.appendChild(gameOver);
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
      <div>
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
       </div>`;
      this.leaderBoardSorted.forEach((e, i) => {
        if (i > 4) {
          return 0;
        }
        gameOver.querySelector('tbody').innerHTML += `
          <tr>
            <td>${e.name}</td>
            <td>${e.score}</td>
            <td>${e.speed}</td>
          </tr>`;
      });
      // Reset
      gameOver.addEventListener('click', e => {
        if (e.target.className.match('game-over')) {
          gameOver.remove();
          this.score = 0;
          this.scoreSpan.innerHTML = this.score;
          timer.textContent = 30;
          this.playing = true;
          this.startCountdown();
          this.resetValues();
          [...prevousQDiv.children].forEach(child => {
            prevousQDiv.firstElementChild.remove();
          });
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
    form.style.visibility = 'hidden';//AQUI
    // Select Operator
    this.operator.innerHTML = operators[Math.floor(Math.random() * operators.length)];
    // Select Disable
    
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
    const a = [Math.floor(Math.random() * this.limit)];
    if (this.answerIndex == 0) {
      switch (this.operator.innerHTML) {
        case '+':
          this.correctAnswer = a - disabledValue;
          break;
        case '-':
          this.correctAnswer = parseFloat(a) + parseFloat(disabledValue);
          break;
        case 'x':
          this.correctAnswer = Math.floor((a / disabledValue) * 100) / 100;
          break;
        case '÷':
          this.correctAnswer = Math.floor(disabledValue * a * 100) / 100;
          break;
        default:
          return '';
      }
    } else {
      switch (this.operator.innerHTML) {
        case '+':
          this.correctAnswer = a - disabledValue;
          break;
        case '-':
          console.log('Index: ', this.answerIndex)
          this.correctAnswer = (a - disabledValue) * -1;
          break;
        case 'x':
          this.correctAnswer = Math.round((a / disabledValue) * 100) / 100;
          break;
        case '÷':
          this.correctAnswer = Math.floor((disabledValue / a) * 100) / 100;
          break;
        default:
          return '';
      }
    }
    console.log(this.correctAnswer)
    if (this.correctAnswer == Infinity) {
      this.checkQuestion();
      return;
    }
    if (hard) {
      this.result.value = a;
      form.style.visibility = 'visible';
      this.answer.focus();
    } else if (this.correctAnswer < 0 || this.correctAnswer % 1 > 0 || this.correctAnswer == 0) {
      this.checkQuestion();
      return;
    }
    this.result.value = a;
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
      prevQuestion.classList.add('correct');
      prevousQDiv.append(prevQuestion);
      this.resetValues();
      this.ui.parentElement.classList.add('correct');
      this.ui.innerHTML = 'Correct!';
      this.score++;
      this.scoreSpan.innerHTML = this.score;
      this.last.innerHTML = '';
    } else {
      prevQuestion.classList.add('wrong');
      prevousQDiv.append(prevQuestion);
      this.resetValues();
      this.ui.parentElement.classList.remove('correct');
      this.ui.innerHTML = 'Wrong!';
      this.last.innerHTML = `Correct answer was: ${this.correctAnswer}`;
    }
    [...prevousQDiv.children].forEach((child, i) => {
      if (i > 2) {
        prevousQDiv.firstElementChild.remove();
      }
    });
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
let limit = 10;
let game;
let hard = false;
// Modal
const modal = document.querySelector('.modal');

form.addEventListener('submit', answer);
function answer(e) {
  e.preventDefault();
  answers.forEach(answer => {
    if (!answer.disabled) {
      game.checkAnswer(answer.value);
    }
  });
}

modal.addEventListener('click', e => {
  e.preventDefault();
  const selection = e.target.className;
  switch (selection) {
    case 'e':
      operators = ['+', '-'];      
      break;
    case 'm':
      operators = ['+', '-', 'x', '÷'];      
      break;
    case 'h':
      operators = ['+', '-', 'x', '÷'];      
      break;
    case 'i':
      operators = ['+', '-', 'x', '÷'];     
      hard = true;
      limit = 99; 
      break;
  
    default:
      return
  }
  modal.remove();

  // Init game
  game = new Game(operator, answers, result, ui, last, score, limit, timer);
});
