# filter_repeats.py
# Applies game rules to the word list:
# 1. No letter appears more than twice
# 2. Word needs no more than 5 vowels (game limit)
# 3. Word needs no more than 6 consonants (game limit)

from collections import Counter

input_file = 'data/words_filtered.txt'
output_file = 'data/words_filtered.txt'

VOWELS = set('aeiou')

with open(input_file, 'r') as f:
    words = f.read().splitlines()

def has_no_excess_repeats(word):
    counts = Counter(word.lower())
    return all(count <= 2 for count in counts.values())

def fits_game_limits(word):
    vowel_count = sum(1 for c in word.lower() if c in VOWELS)
    consonant_count = sum(1 for c in word.lower() if c not in VOWELS)
    return vowel_count <= 5 and consonant_count <= 6

filtered = [w for w in words if has_no_excess_repeats(w) and fits_game_limits(w)]

with open(output_file, 'w') as f:
    f.write('\n'.join(filtered))

print(f'Before: {len(words)} words')
print(f'After:  {len(filtered)} words')
print(f'Removed: {len(words) - len(filtered)} words')