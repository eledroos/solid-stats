interface RadarChartProps {
  data: Record<string, number>;
  colors: Record<string, string>;
  size?: number;
}

export function RadarChart({ data, colors, size = 180 }: RadarChartProps) {
  const keys = Object.keys(data);
  const numPoints = keys.length;
  const maxVal = Math.max(1, ...Object.values(data));
  const radius = size * 0.32;
  const center = size / 2;

  // Calculate point positions
  const getPoint = (value: number, index: number): [number, number] => {
    const angle = (Math.PI * 2 * index) / numPoints - Math.PI / 2;
    const normalizedValue = Math.max(value, maxVal * 0.08) / maxVal;
    const dist = normalizedValue * radius;
    return [
      center + Math.cos(angle) * dist,
      center + Math.sin(angle) * dist,
    ];
  };

  const getLabelPoint = (index: number): [number, number] => {
    const angle = (Math.PI * 2 * index) / numPoints - Math.PI / 2;
    const dist = radius * 1.45;
    return [
      center + Math.cos(angle) * dist,
      center + Math.sin(angle) * dist,
    ];
  };

  // Generate polygon points
  const dataPoints = keys.map((_, i) => getPoint(data[keys[i]], i));
  const outerPoints = keys.map((_, i) => getPoint(maxVal, i));
  const midPoints = keys.map((_, i) => getPoint(maxVal * 0.5, i));

  const dataPolygon = dataPoints.map(p => p.join(',')).join(' ');
  const outerPolygon = outerPoints.map(p => p.join(',')).join(' ');
  const midPolygon = midPoints.map(p => p.join(',')).join(' ');

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full overflow-visible">
        {/* Background grid - outer polygon */}
        <polygon
          points={outerPolygon}
          fill="none"
          stroke="#cbd5e1"
          strokeWidth="1"
          strokeDasharray="4 4"
        />

        {/* Background grid - mid polygon */}
        <polygon
          points={midPolygon}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {/* Axis lines */}
        {keys.map((_, i) => {
          const [x, y] = getPoint(maxVal, i);
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          );
        })}

        {/* Data polygon with gradient fill */}
        <polygon
          points={dataPolygon}
          fill="white"
          fillOpacity="0.85"
          stroke="black"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Colored glow circles behind vertices */}
        {keys.map((key, i) => {
          const [x, y] = dataPoints[i];
          return (
            <circle
              key={`glow-${i}`}
              cx={x}
              cy={y}
              r={12}
              fill={colors[key]}
              fillOpacity="0.2"
            />
          );
        })}

        {/* Vertex dots */}
        {keys.map((key, i) => {
          const [x, y] = dataPoints[i];
          return (
            <circle
              key={`dot-${i}`}
              cx={x}
              cy={y}
              r={4}
              fill={colors[key]}
              stroke="white"
              strokeWidth="1.5"
              className="hover:opacity-80 transition-opacity"
            />
          );
        })}

        {/* Labels */}
        {keys.map((key, i) => {
          const [x, y] = getLabelPoint(i);
          const count = data[key];

          return (
            <g key={`label-${i}`}>
              <text
                x={x}
                y={y - 5}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-black uppercase fill-black"
                style={{ fontSize: '7px', letterSpacing: '-0.02em' }}
              >
                {key.split(' ').map((word, wi) => (
                  <tspan key={wi} x={x} dy={wi === 0 ? 0 : '8px'}>
                    {word}
                  </tspan>
                ))}
              </text>
              <text
                x={x}
                y={y + (key.includes(' ') ? 12 : 6)}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-bold fill-gray-500"
                style={{ fontSize: '8px' }}
              >
                {count}
              </text>
            </g>
          );
        })}

        {/* Center dot */}
        <circle
          cx={center}
          cy={center}
          r={2}
          fill="#94a3b8"
        />
      </svg>
    </div>
  );
}
