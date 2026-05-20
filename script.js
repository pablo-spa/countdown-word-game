// ── Audio ─────────────────────────────────────────────────────
// This creates an audio object pointing to our music file
const timerMusic = new Audio('timer-music.mp3');
// ── Letter pools ──────────────────────────────────────────────
// These are the two sets of letters the player can pick from.
const VOWELS = ['A', 'E', 'I', 'O', 'U'];
const CONSONANTS = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];

// ── Game state ────────────────────────────────────────────────
// This array will store the letters the player has chosen so far.
// We start with an empty array and add to it as they click.
let selectedLetters = [];

// ── Pick a random letter ──────────────────────────────────────
// Math.random() gives a decimal between 0 and 1 (e.g. 0.73)
// Multiplying by array.length scales it to the array size (e.g. 3.65)
// Math.floor() rounds down to a whole number (e.g. 3)
// That number is used as the index to grab an item from the array
function pickLetter(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// ── Add a letter to the board ─────────────────────────────────
// This function adds a letter tile to the page and records it.
function addLetter(letter) {
  // Stop if the player already has 9 letters
  if (selectedLetters.length >= 9) return;

  // Save the letter in our array
  selectedLetters.push(letter);

  // Find the board element in the HTML
  const board = document.getElementById('letter-board');

  // Create a new <div> element to act as the tile
  const tile = document.createElement('div');
  tile.classList.add('tile');   // add a CSS class so we can style it
  tile.textContent = letter;    // set the text inside the tile

  // Add the tile to the board on the page
  board.appendChild(tile);
}

// ── Button event listeners ────────────────────────────────────
// These listen for clicks on the Vowel and Consonant buttons.
// When clicked, they pick a random letter from the right pool
// and call addLetter() to show it on the board.

document.getElementById('vowel-btn').addEventListener('click', function() {
  const letter = pickLetter(VOWELS);
  addLetter(letter);
});

document.getElementById('consonant-btn').addEventListener('click', function() {
  const letter = pickLetter(CONSONANTS);
  addLetter(letter);
});

// ── Timer ─────────────────────────────────────────────────────
// We store the interval ID so we can stop it later
let timerInterval = null;

// This function starts the 30 second countdown
function startTimer() {
  // Don't start a second timer if one is already running
  if (timerInterval !== null) return;
  // Play the music when the timer starts
  timerMusic.play();
  let timeLeft = 30;

  // setInterval runs a function repeatedly, every 1000ms (1 second)
  timerInterval = setInterval(function() {
    timeLeft--;

    // Update the number shown on the page
    document.getElementById('timer').textContent = timeLeft;

    // When it hits 0, stop the timer
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      // Stop the music when the timer ends
      timerMusic.pause();
      timerMusic.currentTime = 0; // rewind to the start for next round 

      // Disable the letter buttons so no more letters can be added
      document.getElementById('vowel-btn').disabled = true;
      document.getElementById('consonant-btn').disabled = true;
    }
  }, 1000);
}

// Listen for the Start Timer button
document.getElementById('start-btn').addEventListener('click', startTimer);

// ── Dictionary ────────────────────────────────────────────────
// We'll store all valid words in a Set (like an array but much
// faster for checking if a word exists)
let dictionary = new Set();

// Fetch the word list file and load it into the Set
// fetch() loads a file asynchronously (in the background)
fetch('data/words.txt')
  .then(response => response.text())   // read the file as text
  .then(text => {
    // Split the text into individual words (one per line)
    // and add each one to our Set
    text.split('\n').forEach(word => {
      dictionary.add(word.trim().toLowerCase());
    });
    console.log('Dictionary loaded:', dictionary.size, 'words');
  });

// ── Word validation ───────────────────────────────────────────
// Check if the player's word only uses available letters
function isValidLetterUse(word, letters) {
  // Make a copy of the letters array so we can remove letters as we use them
  let available = [...letters];

  for (let char of word.toUpperCase()) {
    let index = available.indexOf(char);
    // If the letter isn't available, the word is invalid
    if (index === -1) return false;
    // Remove the used letter so it can't be used twice
    available.splice(index, 1);
  }
  return true;
}

// ── Submit button ─────────────────────────────────────────────
document.getElementById('submit-btn').addEventListener('click', function() {
  const word = document.getElementById('player-word').value.trim().toLowerCase();

  if (word === '') return;

  const inDictionary = dictionary.has(word);
  const usesValidLetters = isValidLetterUse(word, selectedLetters);

  if (inDictionary && usesValidLetters) {
    alert('✅ Valid word! ' + word.length + ' letters');
  } else if (!usesValidLetters) {
    alert('❌ You used letters that aren\'t on the board!');
  } else {
    alert('❌ Not a valid English word');
  }
});