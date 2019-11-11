// Game
class Game {
  constructor(operator, answers, result, ui, last, score, limit) {
    this.operator = operator;
    this.answers = answers;
    this.result = result;
    this.ui = ui;
    this.last = last;
    this.scoreSpan = score;
    this.score = 0;
    this.limit = limit;
    this.correctAnswer = '';
    this.resetValues();
  }

  resetValues() {
    setTimeout(() => {
      this.answers.forEach(answer => {
        answer.value = null;
        answer.disabled = false;
      });
      this.displayQuestion();
    }, 0);
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
    if (hard) {
      form.style.visibility = 'visible';
      this.answer.focus();
    } else if (
      this.correctAnswer < 0 ||
      this.correctAnswer % 1 > 0 ||
      this.correctAnswer == 0 ||
      this.correctAnswer == Infinity
    ) {
      this.resetValues();
      return;
    }
    form.style.visibility = 'visible';
    this.answer.focus();
  }

  checkAnswer(answer) {
    const answerValue = parseFloat(answer);
    if (answerValue == this.correctAnswer) {
      this.resetValues();
      this.ui.parentElement.classList.add('correct');
      this.ui.innerHTML = 'Correct!';
      this.score++;
      this.scoreSpan.innerHTML = this.score;
      this.last.innerHTML = '';
    } else {
      this.resetValues();
      this.ui.parentElement.classList.remove('correct');
      this.ui.innerHTML = 'Wrong!';
      this.last.innerHTML = `Correct answer was: ${this.correctAnswer}`;
    }
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
  if (selection == 'e') {
    operators = ['+', '-'];
  } else if (selection == 'm') {
    operators = ['+', '-', 'x', '÷'];
  } else if (selection == 'h') {
    operators = ['+', '-', 'x', '÷'];
    hard = true;
  } else if (selection == 'i') {
    operators = ['+', '-', 'x', '÷'];
    hard = true;
    limit = 99;
  }
  modal.remove();
  // Init game
  game = new Game(operator, answers, result, ui, last, score, limit);
});
