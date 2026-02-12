import { useState, useMemo } from 'react';
import { formatDate } from '../utils/calculations';
import './WeightChart.css';

const WeightChart = ({ weights, height, goalWeight }) => {
    const [hoveredPoint, setHoveredPoint] = useState(null);

    // Filter and sort weights
    const sortedWeights = useMemo(() => {
        return [...weights].sort((a, b) => new Date(a.date) - new Date(b.date));
    }, [weights]);

    if (sortedWeights.length < 2) {
        return (
            <div className="chart-empty-state">
                <p>Se necesitan al menos 2 registros para mostrar la gráfica.</p>
            </div>
        );
    }

    // Chart dimensions
    const width = 600;
    const heightPx = 300;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = heightPx - padding * 2;

    // Calculate scales
    const minWeight = Math.min(...sortedWeights.map(w => w.value), goalWeight || 1000) - 1;
    const maxWeight = Math.max(...sortedWeights.map(w => w.value), goalWeight || 0) + 1;
    const weightRange = maxWeight - minWeight;

    const dates = sortedWeights.map(w => new Date(w.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const dateRange = maxDate - minDate || 1; // Avoid division by zero

    // Coordinate helpers
    const getX = (dateStr) => {
        const timestamp = new Date(dateStr).getTime();
        return padding + ((timestamp - minDate) / dateRange) * chartWidth;
    };

    const getY = (weight) => {
        return padding + chartHeight - ((weight - minWeight) / weightRange) * chartHeight;
    };

    // Generate path
    const pathD = sortedWeights.map((w, i) => {
        const x = getX(w.date);
        const y = getY(w.value);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');

    // Generate smooth area path (for gradient under the line)
    const areaPathD = `
        ${pathD}
        L ${getX(sortedWeights[sortedWeights.length - 1].date)} ${heightPx - padding}
        L ${padding} ${heightPx - padding}
        Z
    `;

    return (
        <div className="weight-chart-container">
            <h3>Tendencia de Peso</h3>
            <div className="chart-wrapper">
                <svg viewBox={`0 0 ${width} ${heightPx}`} className="weight-chart-svg">
                    <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-accent-primary)" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="var(--color-accent-primary)" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines (Horizontal) */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                        const y = padding + (chartHeight * ratio);
                        const weightValue = maxWeight - (weightRange * ratio);
                        return (
                            <g key={ratio} className="grid-line">
                                <line x1={padding} y1={y} x2={width - padding} y2={y} />
                                <text x={padding - 10} y={y + 4} textAnchor="end">{weightValue.toFixed(0)}</text>
                            </g>
                        );
                    })}

                    {/* Goal Line */}
                    {goalWeight && (
                        <g className="goal-line-g">
                            <line
                                x1={padding}
                                y1={getY(goalWeight)}
                                x2={width - padding}
                                y2={getY(goalWeight)}
                                strokeDasharray="5,5"
                                className="chart-goal-line"
                            />
                            <text x={width - padding + 5} y={getY(goalWeight) + 4} className="goal-text">Meta</text>
                        </g>
                    )}

                    {/* Area under line */}
                    <path d={areaPathD} fill="url(#lineGradient)" />

                    {/* Weight Line */}
                    <path d={pathD} fill="none" stroke="var(--color-accent-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Data Points */}
                    {sortedWeights.map((w, i) => (
                        <circle
                            key={i}
                            cx={getX(w.date)}
                            cy={getY(w.value)}
                            r="6"
                            className="chart-point"
                            onMouseEnter={() => setHoveredPoint({ ...w, x: getX(w.date), y: getY(w.value) })}
                            onMouseLeave={() => setHoveredPoint(null)}
                        />
                    ))}
                </svg>

                {/* Tooltip */}
                {hoveredPoint && (
                    <div
                        className="chart-tooltip"
                        style={{ left: `${(hoveredPoint.x / width) * 100}%`, top: `${(hoveredPoint.y / heightPx) * 100}%` }}
                    >
                        <div className="tooltip-date">{formatDate(hoveredPoint.date)}</div>
                        <div className="tooltip-value">{hoveredPoint.value} kg</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WeightChart;
