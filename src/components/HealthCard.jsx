import { useMemo } from 'react';
import { calculateDailyWater, calculateBMR, getHealthTip, calculateBMI, getBMIClassification } from '../utils/calculations';
import './HealthCard.css';

const HealthCard = ({ weight, height }) => {
    const dailyWater = calculateDailyWater(weight);
    const bmr = calculateBMR(weight, height);
    const bmi = calculateBMI(weight, height);
    const bmiStatus = getBMIClassification(bmi).status;

    // Memoize tip so it doesn't change on every render, but changes if BMI status changes
    // We append a random ID to dependency array if we wanted to force refresh, 
    // but here we want stability per session/view.
    const healthTip = useMemo(() => getHealthTip(bmiStatus), [bmiStatus]);

    return (
        <div className="health-card">
            <h3>❤️ Salud y Bienestar</h3>

            <div className="wellness-grid">
                <div className="wellness-item">
                    <div className="wellness-icon">💧</div>
                    <div className="wellness-info">
                        <span className="wellness-label">Agua Diaria</span>
                        <span className="wellness-value">{dailyWater} L</span>
                    </div>
                </div>

                <div className="wellness-item">
                    <div className="wellness-icon">🔥</div>
                    <div className="wellness-info">
                        <span className="wellness-label">Metabolismo Basal</span>
                        <span className="wellness-value">~{bmr} kcal</span>
                    </div>
                </div>

                <div className="tip-box">
                    <div className="tip-header">
                        <span>💡 Tip Saludable</span>
                    </div>
                    <p className="tip-text">"{healthTip}"</p>
                </div>
            </div>
        </div>
    );
};

export default HealthCard;
