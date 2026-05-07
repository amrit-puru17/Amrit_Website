/**
 * charts.js — Growth Trend Visualisation
 */
document.addEventListener('DOMContentLoaded', () => {
  const ctx = document.getElementById('growthChart');
  if (!ctx) return;

  const isDark = document.body.classList.contains('dark');
  const accentColor = '#a38b78';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const textColor = isDark ? '#a0a0a0' : '#666666';

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan 2023', 'Apr 2023', 'May 2023', 'Dec 2023', 'Jan 2024', 'Present'],
      datasets: [{
        label: 'Professional Maturity',
        data: [15, 30, 45, 65, 85, 100],
        borderColor: accentColor,
        backgroundColor: 'rgba(163, 139, 120, 0.05)',
        borderWidth: 2,
        pointBackgroundColor: accentColor,
        pointBorderColor: isDark ? '#1a1a1a' : '#fafaf8',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
          titleColor: isDark ? '#ffffff' : '#1a1a1a',
          bodyColor: textColor,
          borderColor: accentColor,
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(context) {
              const goals = [
                'Pivot Risks: Actuarial Basics',
                'Internship Completion',
                'Freelance: Python & SQL Focus',
                'Advanced DAX & Automation',
                'MORE Group: Corporate Analytics',
                'Current: Full-Stack Data Impact'
              ];
              return goals[context.dataIndex];
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 110,
          grid: { color: gridColor },
          ticks: { display: false }
        },
        x: {
          grid: { display: false },
          ticks: {
            color: textColor,
            font: { family: "'EB Garamond', serif", size: 12 }
          }
        }
      }
    }
  });

  // Theme toggle listener
  document.getElementById('theme-btn').addEventListener('click', () => {
    const isDarkNow = document.body.classList.contains('dark');
    const newGridColor = isDarkNow ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const newTextColor = isDarkNow ? '#a0a0a0' : '#666666';

    chart.options.scales.y.grid.color = newGridColor;
    chart.options.scales.x.ticks.color = newTextColor;
    chart.options.plugins.tooltip.backgroundColor = isDarkNow ? '#2a2a2a' : '#ffffff';
    chart.options.plugins.tooltip.titleColor = isDarkNow ? '#ffffff' : '#1a1a1a';
    chart.update();
  });
});
