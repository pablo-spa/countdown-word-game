fetch('data/analysis.json')
  .then(response => response.json())
  .then(data => {

    // ── Chart 1: Raw vs Coverage weights comparison ────────────
    const letters = Object.keys(data.raw_weights).sort((a, b) =>
      data.coverage_weights[b] - data.coverage_weights[a]
    );

    const ctx1 = document.getElementById('letterChart').getContext('2d');
    new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: letters,
        datasets: [
          {
            label: 'Raw frequency (%)',
            data: letters.map(l => data.raw_weights[l]),
            backgroundColor: 'rgba(243, 139, 168, 0.5)',
            borderColor: 'rgba(243, 139, 168, 0.8)',
            borderWidth: 1,
            borderRadius: 4
          },
          {
            label: 'Word coverage (%)',
            data: letters.map(l => data.coverage_weights[l]),
            backgroundColor: 'rgba(180, 190, 254, 0.5)',
            borderColor: 'rgba(180, 190, 254, 0.8)',
            borderWidth: 1,
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#cdd6f4', font: { family: 'JetBrains Mono' } } }
        },
        scales: {
          x: { ticks: { color: '#cdd6f4' }, grid: { color: 'rgba(69,71,90,0.5)' } },
          y: {
            ticks: { color: '#cdd6f4' },
            grid: { color: 'rgba(69,71,90,0.5)' },
            title: { display: true, text: 'Weight (%)', color: '#a6adc8' }
          }
        }
      }
    });

    // ── Chart 2: Word length distribution ─────────────────────
    const lengths = Object.keys(data.length_distribution);
    const counts  = Object.values(data.length_distribution);

    const ctx2 = document.getElementById('lengthChart').getContext('2d');
    new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: lengths.map(l => l + ' letters'),
        datasets: [{
          label: 'Number of words',
          data: counts,
          backgroundColor: lengths.map((_, i) =>
            i === counts.indexOf(Math.max(...counts))
              ? 'rgba(203, 166, 247, 0.7)'  // highlight the peak
              : 'rgba(148, 226, 213, 0.5)'
          ),
          borderColor: 'rgba(148, 226, 213, 0.8)',
          borderWidth: 1,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { labels: { color: '#cdd6f4', font: { family: 'JetBrains Mono' } } }
        },
        scales: {
          x: { ticks: { color: '#cdd6f4' }, grid: { color: 'rgba(69,71,90,0.5)' } },
          y: {
            ticks: { color: '#cdd6f4' },
            grid: { color: 'rgba(69,71,90,0.5)' },
            title: { display: true, text: 'Word count', color: '#a6adc8' }
          }
        }
      }
    });
  });