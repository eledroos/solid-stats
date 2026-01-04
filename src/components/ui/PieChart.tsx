interface PieSlice {
  name: string;
  value: number;
  color: string;
  percent: number;
}

interface PieChartProps {
  data: PieSlice[];
}

export function PieChart({ data }: PieChartProps) {
  const getCoordinatesForPercent = (percent: number): [number, number] => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const slicesWithLabels: { path: JSX.Element; label: JSX.Element | null }[] = [];
  let runningPercent = 0;

  data.forEach((slice, i) => {
    const startPercent = runningPercent;
    const [startX, startY] = getCoordinatesForPercent(startPercent);
    runningPercent += slice.percent;
    const [endX, endY] = getCoordinatesForPercent(runningPercent);
    const largeArcFlag = slice.percent > 0.5 ? 1 : 0;

    const pathData = [
      `M 0 0`,
      `L ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `Z`
    ].join(' ');

    const path = (
      <path
        key={`path-${i}`}
        d={pathData}
        fill={slice.color}
        stroke="black"
        strokeWidth="0.05"
        className="hover:opacity-80 transition-opacity cursor-pointer"
      />
    );

    // Only show label if slice is large enough (>12%)
    let label: JSX.Element | null = null;
    if (slice.percent > 0.12) {
      // Calculate label position at the midpoint of the slice
      const midPercent = startPercent + slice.percent / 2;
      const labelRadius = 0.6;
      const labelX = Math.cos(2 * Math.PI * midPercent) * labelRadius;
      const labelY = Math.sin(2 * Math.PI * midPercent) * labelRadius;

      label = (
        <text
          key={`label-${i}`}
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          transform={`rotate(90, ${labelX}, ${labelY})`}
          className="fill-white font-black pointer-events-none"
          style={{ fontSize: '0.22px' }}
        >
          {slice.value}
        </text>
      );
    }

    slicesWithLabels.push({ path, label });
  });

  return (
    <div className="relative w-24 h-24">
      <svg viewBox="-1.1 -1.1 2.2 2.2" className="transform -rotate-90 w-full h-full">
        {slicesWithLabels.map(s => s.path)}
        {slicesWithLabels.map(s => s.label)}
      </svg>
    </div>
  );
}
