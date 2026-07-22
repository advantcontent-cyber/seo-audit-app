function scoreColor(score: number): string {
  if (score >= 80) return "#0ca30c"; // status-good
  if (score >= 50) return "#fab219"; // status-warning
  return "#d03b3b"; // status-critical
}

function scoreLabel(score: number): string {
  if (score >= 80) return "Good";
  if (score >= 50) return "Needs work";
  return "Poor";
}

export default function SiteHealthGauge({ score }: { score: number }) {
  const size = 152;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = scoreColor(score);

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e1e0d9" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset .6s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-ink">{score}</span>
          <span className="text-xs text-ink-muted">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <div className="text-sm font-medium text-ink" style={{ color }}>
          {scoreLabel(score)}
        </div>
        <div className="text-xs text-ink-muted">Site Health Score</div>
      </div>
    </div>
  );
}
