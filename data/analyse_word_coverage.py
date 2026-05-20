# analyse_word_coverage.py
# Instead of counting raw letter frequency, we count how many
# DIFFERENT words each letter appears in. A letter that appears
# in 50,000 words is more useful than one that appears 50,000
# times in only 10 rare words.

from collections import Counter
import json

input_file = 'data/words_filtered.txt'

with open(input_file, 'r') as f:
    words = f.read().splitlines()

# For each word, count each letter only ONCE
# (even if it appears multiple times in the word)
word_coverage = Counter()

for word in words:
    for letter in set(word.upper()):  # set() removes duplicates
        if letter.isalpha():
            word_coverage[letter] += 1

# Print results
total_words = len(words)
print(f'Total words: {total_words}')
print('\nLetter word coverage:')
for letter, count in word_coverage.most_common():
    percentage = round(count / total_words * 100, 1)
    print(f'  {letter}: {count} words ({percentage}%)')

# Save new weights
weights = {}
total = sum(word_coverage.values())
for letter, count in word_coverage.items():
    weights[letter] = round(count / total * 100, 2)

with open('data/letter_weights_coverage.json', 'w') as f:
    json.dump(weights, f, indent=2)

print('\nSaved to data/letter_weights_coverage.json')