# filter_words.py
# This script reads the full word list and keeps only words
# between 2 and 9 letters — the only ones useful for our game.
# This makes the file much smaller and faster to load.

input_file = 'data/words.txt'
output_file = 'data/words_filtered.txt'

with open(input_file, 'r') as f:
    words = f.read().splitlines()

# Keep only words between 2 and 9 letters, strip whitespace
filtered = [w.strip() for w in words if 2 <= len(w.strip()) <= 9]

with open(output_file, 'w') as f:
    f.write('\n'.join(filtered))

print(f'Original: {len(words)} words')
print(f'Filtered: {len(filtered)} words')
print(f'Saved to {output_file}')