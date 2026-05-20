# analyse_words.py
# Generates two datasets for the about page:
# 1. Comparison of raw frequency weights vs word coverage weights
# 2. Word length distribution

import json
from collections import Counter

input_file = 'data/words_filtered.txt'

with open(input_file, 'r') as f:
    words = f.read().splitlines()

# ── Dataset 1: Raw frequency weights ──────────────────────────
raw_counts = Counter()
for word in words:
    for letter in word.upper():
        if letter.isalpha():
            raw_counts[letter] += 1

total_raw = sum(raw_counts.values())
raw_weights = {k: round(v / total_raw * 100, 2) for k, v in raw_counts.items()}

# ── Dataset 2: Word coverage weights ──────────────────────────
coverage_counts = Counter()
for word in words:
    for letter in set(word.upper()):
        if letter.isalpha():
            coverage_counts[letter] += 1

total_coverage = sum(coverage_counts.values())
coverage_weights = {k: round(v / total_coverage * 100, 2) for k, v in coverage_counts.items()}

# ── Dataset 3: Word length distribution ───────────────────────
length_dist = Counter()
for word in words:
    length_dist[len(word)] += 1

# Save all three to one JSON file
output = {
    'raw_weights': raw_weights,
    'coverage_weights': coverage_weights,
    'length_distribution': {str(k): v for k, v in sorted(length_dist.items())}
}

with open('data/analysis.json', 'w') as f:
    json.dump(output, f, indent=2)

print('Saved to data/analysis.json')
print('\nWord length distribution:')
for length, count in sorted(length_dist.items()):
    print(f'  {length} letters: {count} words')