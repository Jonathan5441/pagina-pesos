import React from 'react';
import './Leaderboard.css';

const Leaderboard = ({ users }) => {
    if (!users || users.length === 0) return null;

    // Calculamos las estadísticas necesarias para cada usuario
    const userStats = users.map(user => {
        if (!user.weights || user.weights.length === 0) return null;

        const initialWeight = user.weights[0].value;
        const currentWeight = user.weights[user.weights.length - 1].value;
        const lossPercentage = ((initialWeight - currentWeight) / initialWeight) * 100;

        return {
            ...user,
            initialWeight,
            currentWeight,
            lossPercentage
        };
    }).filter(Boolean);

    // Categorización
    const categories = [
        {
            id: 'heavy',
            name: 'Pesados',
            icon: '🐘',
            filter: (u) => u.initialWeight > 95
        },
        {
            id: 'normal',
            name: 'Normales',
            icon: '🏃',
            filter: (u) => u.initialWeight >= 75 && u.initialWeight <= 95
        },
        {
            id: 'light',
            name: 'No tan pesados',
            icon: '🎈',
            filter: (u) => u.initialWeight < 75
        }
    ];

    // Encontrar el líder de cada categoría
    const leaders = categories.map(cat => {
        const catUsers = userStats.filter(cat.filter);
        if (catUsers.length === 0) return null;

        // Ordenar por mayor pérdida (o menor ganancia)
        const sorted = [...catUsers].sort((a, b) => b.lossPercentage - a.lossPercentage);
        return {
            category: cat,
            user: sorted[0]
        };
    }).filter(Boolean);

    if (leaders.length === 0) return null;

    return (
        <section className="leaderboard-section">
            <div className="leaderboard-header">
                <h2 className="leaderboard-title">🏆 Top Ganadores</h2>
                <p className="leaderboard-subtitle">Líderes por categoría (% de pérdida)</p>
            </div>

            <div className="leaderboard-grid">
                {leaders.map(({ category, user }) => (
                    <div key={category.id} className={`leader-card leader-card-${category.id}`}>
                        <div className="leader-category-tag">
                            <span className="cat-icon">{category.icon}</span>
                            {category.name}
                        </div>

                        <div className="leader-info">
                            <h3 className="leader-name">{user.name}</h3>
                            <div className="leader-stats">
                                <div className="stat-item">
                                    <span className="stat-label">Pérdida</span>
                                    <span className="stat-value">{user.lossPercentage.toFixed(1)}%</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Actual</span>
                                    <span className="stat-value">{user.currentWeight}kg</span>
                                </div>
                            </div>
                        </div>

                        <div className="leader-decoration">
                            <div className="medal">🥇</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Leaderboard;
