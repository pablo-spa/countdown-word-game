# analyse_letters.py
# Reads the filtered word list and counts how often each letter appears.
# We'll use these counts to weight the letter picker in the game.

from collections import Counter

input_file = 'data/words_filtered.txt'

with open(input_file, 'r') as f:
    words = f.read().splitlines()

# Count every letter across all words
letter_counts = Counter()

for word in words:
    for letter in word.upper():
        if letter.isalpha():  # ignore any non-letter characters
            letter_counts[letter] += 1

# Print results sorted by most common
print('Letter frequencies:')
for letter, count in letter_counts.most_common():
    print(f'  {letter}: {count}')

import json

# Calculate total letters counted
total = sum(letter_counts.values())

# Build a dictionary of letter -> probability (as a percentage)
weights = {}
for letter, count in letter_counts.items():
    weights[letter] = round(count / total * 100, 2)

# Save to a JSON file the game can load
output_file = 'data/letter_weights.json'
with open(output_file, 'w') as f:
    json.dump(weights, f, indent=2)

print(f'\nSaved weights to {output_file}')
print(f'E weight: {weights["E"]}%')
print(f'Q weight: {weights["Q"]}%')