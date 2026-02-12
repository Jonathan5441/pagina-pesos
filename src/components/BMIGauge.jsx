import { calculateBMI, getBMIClassification } from '../utils/calculations';
import './BMIGauge.css';

const BMIGauge = ({ weight, height }) => {
    const bmi = calculateBMI(weight, height);
    const classification = getBMIClassification(bmi);

    // Calculate position on gauge based on visual segments
    // The gauge has 4 equal width segments (25% each) representing different BMI ranges
    let position = 0;

    if (bmi < 18.5) {
        // Segment 1: BMI 15 to 18.5
        position = ((bmi - 15) / (18.5 - 15)) * 25;
    } else if (bmi < 25) {
        // Segment 2: BMI 18.5 to 25
        position = 25 + ((bmi - 18.5) / (25 - 18.5)) * 25;
    } else if (bmi < 30) {
        // Segment 3: BMI 25 to 30
        position = 50 + ((bmi - 25) / (30 - 25)) * 25;
    } else {
        // Segment 4: BMI 30 to 40
        position = 75 + ((bmi - 30) / (40 - 30)) * 25;
    }

    // Clamp position between 0 and 100
    position = Math.min(Math.max(position, 0), 100);

    // Debug log
    console.log('BMI:', bmi, 'Status:', classification.status, 'Color:', classification.color);

    return (
        <div className="bmi-gauge">
            <div className="bmi-gauge-header">
                <h3>Índice de Masa Corporal</h3>
                <div className="bmi-value" style={{ color: classification.color }}>
                    {bmi.toFixed(1)}
                </div>
            </div>

            <div className="bmi-gauge-bar">
                <div className="bmi-gauge-track">
                    <div className="bmi-segment bmi-underweight"></div>
                    <div className="bmi-segment bmi-normal"></div>
                    <div className="bmi-segment bmi-overweight"></div>
                    <div className="bmi-segment bmi-obese"></div>
                </div>
                <div
                    className="bmi-indicator"
                    style={{
                        left: `${position}%`
                    }}
                >
                    <div
                        className="bmi-indicator-dot"
                        style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: classification.color,
                            border: `4px solid ${classification.color}`,
                            boxShadow: '0 4px 6px rgba(0,0,0,0.4)',
                            animation: 'pulse 2s ease-in-out infinite'
                        }}
                    ></div>
                </div>
            </div>

            <div className="bmi-labels">
                <span>15</span>
                <span>18.5</span>
                <span>25</span>
                <span>30</span>
                <span>40</span>
            </div>

            <div className="bmi-status" style={{ background: classification.gradient }}>
                {classification.status}
            </div>

            <div className="bmi-legend">
                <div className="bmi-legend-item">
                    <span className="bmi-legend-color bmi-underweight"></span>
                    <span>Bajo Peso (&lt;18.5)</span>
                </div>
                <div className="bmi-legend-item">
                    <span className="bmi-legend-color bmi-normal"></span>
                    <span>Normal (18.5-24.9)</span>
                </div>
                <div className="bmi-legend-item">
                    <span className="bmi-legend-color bmi-overweight"></span>
                    <span>Sobrepeso (25-29.9)</span>
                </div>
                <div className="bmi-legend-item">
                    <span className="bmi-legend-color bmi-obese"></span>
                    <span>Obesidad (≥30)</span>
                </div>
            </div>
        </div>
    );
};

export default BMIGauge;
