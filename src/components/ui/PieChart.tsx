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
  let cumulativePercent = 0;

  const getCoordinatesForPercent = (percent: number): [number, number] => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const slices = data.map((slice, i) => {
    const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
    cumulativePercent += slice.percent;
    const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
    const largeArcFlag = slice.percent > 0.5 ? 1 : 0;

    const pathData = [
      `M 0 0`,
      `L ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `Z`
    ].join(' ');

    return (
      <path
        key={i}
        d={pathData}
        fill={slice.color}
        stroke="black"
        strokeWidth="0.05"
        className="hover:opacity-80 transition-opacity cursor-pointer"
      />
    );
  });

  return (
    <div className="relative w-24 h-24">
      <svg viewBox="-1.1 -1.1 2.2 2.2" className="transform -rotate-90 w-full h-full">
        {slices}
      </svg>
    </div>
  );
}
