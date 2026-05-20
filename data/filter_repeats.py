# filter_repeats.py
# Removes words where any letter appears more than twice.
# This matches the game rule that no letter can be picked more than twice.

from collections import Counter

input_file = 'data/words_filtered.txt'
output_file = 'data/words_filtered.txt'  # overwrite the same file

with open(input_file, 'r') as f:
    words = f.read().splitlines()

def has_no_excess_repeats(word):
    counts = Counter(word.lower())
    return all(count <= 2 for count in counts.values())

filtered = [w for w in words if has_no_excess_repeats(w)]

with open(output_file, 'w') as f:
    f.write('\n'.join(filtered))

print(f'Before: {len(words)} words')
print(f'After:  {len(filtered)} words')
print(f'Removed: {len(words) - len(filtered)} words')