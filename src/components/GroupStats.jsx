import React from 'react';
import './GroupStats.css';

const GroupStats = ({ users }) => {
    if (!users || users.length === 0) return null;

    // Calcular pérdida total del grupo
    const totalLoss = users.reduce((acc, user) => {
        if (!user.weights || user.weights.length < 2) return acc;
        const initial = user.weights[0].value;
        const current = user.weights[user.weights.length - 1].value;
        const loss = initial - current;
        return acc + (loss > 0 ? loss : 0);
    }, 0);

    const totalUsers = users.length;
    const usersWithLoss = users.filter(user => {
        if (!user.weights || user.weights.length < 2) return false;
        return user.weights[0].value > user.weights[user.weights.length - 1].value;
    }).length;

    return (
        <div className="group-stats-container">
            <div className="group-stats-card">
                <div className="group-stats-main">
                    <span className="group-stats-emoji">💪</span>
                    <div className="group-stats-info">
                        <h3 className="group-stats-label">Impacto Colectivo</h3>
                        <div className="group-stats-value">
                            {totalLoss.toFixed(1)} <span className="unit">kg</span>
                        </div>
                        <p className="group-stats-description">
                            Perdidos entre todos los integrantes
                        </p>
                    </div>
                </div>

                <div className="group-stats-mini">
                    <div className="mini-stat">
                        <span className="mini-value">{totalUsers}</span>
                        <span className="mini-label">Participantes</span>
                    </div>
                    <div className="mini-divider"></div>
                    <div className="mini-stat">
                        <span className="mini-value">{usersWithLoss}</span>
                        <span className="mini-label">En Progreso</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GroupStats;
