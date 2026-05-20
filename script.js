// =============================================================
// COUNTDOWN WORD GAME — script.js
// =============================================================


// ── Constants ─────────────────────────────────────────────────
const VOWELS     = ['A', 'E', 'I', 'O', 'U'];
const CONSONANTS = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L',
                    'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W',
                    'X', 'Y', 'Z'];


// ── Game State ─────────────────────────────────────────────────
let selectedLetters = [];
let vowelCount      = 0;
let consonantCount  = 0;
let score           = 0;
let timerInterval   = null;
let isPaused        = false;
let isMuted         = false;
let submittedWords  = [];
let timeRemaining   = null;
let gameActive      = false;


// ── Audio ──────────────────────────────────────────────────────
const timerMusic = new Audio('timer-music.mp3');


// ── Letter Weights (from Python analysis) ─────────────────────
let letterWeights = {};

fetch('data/letter_weights_coverage.json')
  .then(response => response.json())
  .then(data => {
    letterWeights = data;
    console.log('Letter weights loaded');
  });


// ── Dictionary ─────────────────────────────────────────────────
let dictionary = new Set();

fetch('data/words_filtered.txt')
  .then(response => response.text())
  .then(text => {
    text.split('\n').forEach(word => {
      dictionary.add(word.trim().toLowerCase());
    });
    console.log('Dictionary loaded:', dictionary.size, 'words');
  });


// =============================================================
// HELPER FUNCTIONS
// =============================================================

// Returns true if the letter has already been picked twice
function isAtRepeatLimit(letter) {
  return selectedLetters.filter(l => l === letter).length >= 2;
}

// Picks a random letter from a pool using frequency weights
ffunction pickLetter(pool) {
  let totalWeight = pool.reduce((sum, letter) => {
    const timesAlreadyPicked = selectedLetters.filter(l => l === letter).length;
    // Reduce weight by 80% if already picked once
    const penalty = timesAlreadyPicked > 0 ? 0.2 : 1;
    return sum + (letterWeights[letter] || 1) * penalty;
  }, 0);

  let random = Math.random() * totalWeight;

  for (let letter of pool) {
    const timesAlreadyPicked = selectedLetters.filter(l => l === letter).length;
    const penalty = timesAlreadyPicked > 0 ? 0.2 : 1;
    random -= (letterWeights[letter] || 1) * penalty;
    if (random <= 0) return letter;
  }

  return pool[pool.length - 1];
}

// Checks if a word can be formed from the given letters
function canFormWord(word, letters) {
  let available = [...letters];
  for (let char of word.toUpperCase()) {
    let index = available.indexOf(char);
    if (index === -1) return false;
    available.splice(index, 1);
  }
  return true;
}

// Returns points for a word based on its length
function getPoints(word) {
  const len = word.length;
  if (len <= 3) return 1;
  if (len <= 5) return 2;
  if (len <= 7) return 4;
  if (len === 8) return 7;
  return 20; // 9 letters — double points!
}


// =============================================================
// GAME FUNCTIONS
// =============================================================

// Adds a letter tile to the board
function addLetter(letter) {
  if (selectedLetters.length >= 9) return;

  selectedLetters.push(letter);

  const board = document.getElementById('letter-board');
  const tile  = document.createElement('div');
  tile.classList.add('tile');
  tile.textContent = letter;
  board.appendChild(tile);
}

// Shows a styled feedback message that fades after 2 seconds
function showFeedback(message, isValid) {
  const feedback       = document.getElementById('feedback');
  feedback.textContent = message;
  feedback.className   = isValid ? 'valid' : 'invalid';

  setTimeout(() => {
    feedback.textContent = '';
    feedback.className   = '';
  }, 2000);
}

// Updates the score display
function updateScore(word) {
  const points = getPoints(word);
  score += points;
  document.getElementById('score-display').textContent = score;
  showFeedback('+' + points + ' pts — ' + word.toUpperCase(), true);
}

// Starts the countdown
function startTimer(startFrom = null) {
  if (timerInterval !== null) return;

  // Don't start unless all 9 letters have been picked
  if (selectedLetters.length < 9) {
    showFeedback('pick all 9 letters first', false);
    return;
  }

  gameActive = true;

  const chosen = parseInt(document.getElementById('timer-input').value);
  let timeLeft = startFrom !== null ? startFrom : (isNaN(chosen) || chosen < 10 ? 30 : chosen);

  document.getElementById('timer').textContent = timeLeft;
  timerMusic.play();

  timerInterval = setInterval(function() {
    timeLeft--;
    timeRemaining = timeLeft;
    document.getElementById('timer').textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      gameActive    = false;
      timerMusic.pause();
      timerMusic.currentTime = 0;
      document.getElementById('vowel-btn').disabled     = true;
      document.getElementById('consonant-btn').disabled = true;
      document.getElementById('timer').textContent      = 'done';
    }
  }, 1000);
}

// Finds the top 5 best words from the current letters
function findBestWords() {
  let validWords = [];

  dictionary.forEach(word => {
    if (word.length >= 2 && word.length <= 9) {
      if (canFormWord(word, selectedLetters)) {
        validWords.push(word);
      }
    }
  });

  return validWords
    .sort((a, b) => b.length - a.length)
    .slice(0, 5);
}

// Updates the submitted words display
function updateSubmittedWords() {
  const display = document.getElementById('submitted-words');
  display.innerHTML = submittedWords
    .map(w => `<span class="submitted-word">${w.toUpperCase()} (+${getPoints(w)})</span>`)
    .join('');
}


// =============================================================
// EVENT LISTENERS
// =============================================================

// ── Quickstart button ──────────────────────────────────────────
// Automatically picks 3 vowels and 6 consonants, then starts the timer
document.getElementById('quickstart-btn').addEventListener('click', function() {
  // Reset first to clear any previous game
  document.getElementById('reset-btn').click();

  // Pick 3 vowels
  for (let i = 0; i < 3; i++) {
    document.getElementById('vowel-btn').click();
  }

  // Pick 6 consonants
  for (let i = 0; i < 6; i++) {
    document.getElementById('consonant-btn').click();
  }

  // Start the timer
  startTimer();
});

// ── Keyboard support ───────────────────────────────────────────
// Press Enter to submit a word instead of clicking Submit
document.getElementById('player-word').addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    document.getElementById('submit-btn').click();
  }
});

// ── Vowel button ───────────────────────────────────────────────
document.getElementById('vowel-btn').addEventListener('click', function() {
  if (selectedLetters.length >= 9) return;
  if (vowelCount >= 5) return;

  let letter   = pickLetter(VOWELS);
  let attempts = 0;
  while (isAtRepeatLimit(letter) && attempts < 20) {
    letter = pickLetter(VOWELS);
    attempts++;
  }

  addLetter(letter);
  vowelCount++;

  if (vowelCount >= 5)             document.getElementById('vowel-btn').disabled     = true;
  if (selectedLetters.length >= 9) document.getElementById('consonant-btn').disabled = true;
});

// ── Consonant button ───────────────────────────────────────────
document.getElementById('consonant-btn').addEventListener('click', function() {
  if (selectedLetters.length >= 9) return;
  if (consonantCount >= 6) return;

  let letter   = pickLetter(CONSONANTS);
  let attempts = 0;
  while (isAtRepeatLimit(letter) && attempts < 20) {
    letter = pickLetter(CONSONANTS);
    attempts++;
  }

  addLetter(letter);
  consonantCount++;

  if (consonantCount >= 6)         document.getElementById('consonant-btn').disabled = true;
  if (selectedLetters.length >= 9) document.getElementById('vowel-btn').disabled     = true;
});

// ── Start button ───────────────────────────────────────────────
document.getElementById('start-btn').addEventListener('click', function() {
  startTimer();
});

// ── Pause / Resume button ──────────────────────────────────────
document.getElementById('pause-btn').addEventListener('click', function() {
  // Don't do anything if no game is running
  if (selectedLetters.length < 9 && !isPaused && timerInterval === null) return;

  if (isPaused) {
    isPaused         = false;
    this.textContent = 'Pause';
    startTimer(timeRemaining);
    timerMusic.play();
  } else {
    isPaused         = true;
    this.textContent = 'Resume';
    clearInterval(timerInterval);
    timerInterval    = null;
    timerMusic.pause();
  }
});

// ── Mute button ────────────────────────────────────────────────
document.getElementById('mute-btn').addEventListener('click', function() {
  isMuted          = !isMuted;
  timerMusic.muted = isMuted;
  this.textContent = isMuted ? 'Unmute' : 'Mute';
});

// ── Submit button ──────────────────────────────────────────────
document.getElementById('submit-btn').addEventListener('click', function() {
  if (!gameActive) {
    showFeedback('start the game first!', false);
    return;
  }

  const word = document.getElementById('player-word').value.trim().toLowerCase();
  if (word === '') return;

  // Don't allow the same word twice
  if (submittedWords.includes(word)) {
    showFeedback('already submitted that word', false);
    return;
  }

  const inDictionary     = dictionary.has(word);
  const usesValidLetters = canFormWord(word, selectedLetters);

  if (inDictionary && usesValidLetters) {
    updateScore(word);
    submittedWords.push(word);
    showFeedback(word.toUpperCase() + ' — ' + word.length + ' letters, +' + getPoints(word) + ' pts', true);
    document.getElementById('player-word').value = '';
    updateSubmittedWords();
  } else if (!usesValidLetters) {
    showFeedback('letters not on the board', false);
  } else {
    showFeedback('not a valid word', false);
  }
});

// ── Best Words button ──────────────────────────────────────────
document.getElementById('best-words-btn').addEventListener('click', function() {
  const best    = findBestWords();
  const display = document.getElementById('best-words-list');
  display.textContent = best.length === 0 ? 'no words found' : best.join(', ');
});

// ── Reset button ───────────────────────────────────────────────
document.getElementById('reset-btn').addEventListener('click', function() {
  selectedLetters = [];
  vowelCount      = 0;
  consonantCount  = 0;
  score           = 0;
  submittedWords  = [];
  gameActive      = false;
  isPaused        = false;
  timeRemaining   = null;

  updateSubmittedWords();

  const chosen = parseInt(document.getElementById('timer-input').value);
  document.getElementById('letter-board').innerHTML        = '';
  document.getElementById('timer').textContent             = isNaN(chosen) || chosen < 10 ? 30 : chosen;
  document.getElementById('pause-btn').textContent         = 'Pause';
  document.getElementById('player-word').value             = '';
  document.getElementById('best-words-list').textContent   = '';
  document.getElementById('score-display').textContent     = 'Score: 0';
  document.getElementById('feedback').textContent          = '';
  document.getElementById('vowel-btn').disabled            = false;
  document.getElementById('consonant-btn').disabled        = false;

  clearInterval(timerInterval);
  timerInterval = null;

  timerMusic.pause();
  timerMusic.currentTime = 0;
});

// ── Timer input ────────────────────────────────────────────────
// Update timer display live as the player types a new time
document.getElementById('timer-input').addEventListener('input', function() {
  const chosen = parseInt(this.value);
  if (!isNaN(chosen) && chosen >= 10) {
    document.getElementById('timer').textContent = chosen;
  }
});