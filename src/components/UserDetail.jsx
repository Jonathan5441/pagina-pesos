import { useState } from 'react';
import BMIGauge from './BMIGauge';
import { calculateWeightDifference, getLatestWeight, formatDate, calculateGoal, calculatePercentageChange, calculateIdealWeightRange, getUserAchievements } from '../utils/calculations';
import WeightChart from './WeightChart';
import HealthCard from './HealthCard';
import './UserDetail.css';

const UserDetail = ({ user, onBack, onUpdateHeight }) => {
    const [isEditingHeight, setIsEditingHeight] = useState(false);
    const [newHeight, setNewHeight] = useState(user.height);

    const latestWeight = getLatestWeight(user.weights);
    const difference = calculateWeightDifference(user.weights);

    const handleUpdateHeight = async () => {
        if (newHeight <= 0) return;
        await onUpdateHeight(user.id, parseInt(newHeight));
        setIsEditingHeight(false);
    };

    // Sort weights by date (newest first)
    const sortedWeights = [...user.weights].sort((a, b) => new Date(b.date) - new Date(a.date));

    const achievements = getUserAchievements(user);

    return (
        <div className="user-detail animate-fade-in">
            <div className="user-detail-header">
                <button className="btn-back" onClick={onBack}>
                    ← Volver
                </button>
                <div className="user-detail-title">
                    <div className="name-display">
                        <h1>{user.name}</h1>
                        {achievements.length > 0 && (
                            <div className="detail-badges">
                                {achievements.map(badge => (
                                    <div key={badge.id} className="detail-badge" title={badge.description}>
                                        <span className="badge-icon">{badge.icon}</span>
                                        <span className="badge-label">{badge.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="user-detail-grid">
                {/* BMI Section */}
                <div className="detail-section">
                    <BMIGauge weight={latestWeight} height={user.height} />
                </div>

                <div className="detail-section">
                    <HealthCard weight={latestWeight} height={user.height} />
                </div>

                {/* Weight Chart */}
                <div className="detail-section full-width">
                    <WeightChart
                        weights={user.weights}
                        height={user.height}
                        goalWeight={calculateGoal(latestWeight, user.height)?.target}
                    />
                </div>

                {/* Goals & Progress Section */}
                <div className="detail-section">
                    <div className="goals-card card">
                        <h3>Meta y Progreso</h3>
                        {calculateGoal(latestWeight, user.height) && (
                            <div className="goals-content">
                                <div className="goal-status">
                                    <span className="goal-label">
                                        {calculateGoal(latestWeight, user.height).type === 'lose' ? '📉 Meta: Bajar Peso' :
                                            calculateGoal(latestWeight, user.height).type === 'gain' ? '📈 Meta: Subir Peso' :
                                                '✨ Meta: Mantenimiento'}
                                    </span>
                                    <span className="goal-target">
                                        Objetivo: <strong>{calculateGoal(latestWeight, user.height).target} kg</strong>
                                    </span>
                                </div>

                                <div className="progress-container">
                                    <div className="progress-labels">
                                        <span>Inicio: {user.weights[0].value} kg</span>
                                        <span>{calculateGoal(latestWeight, user.height).type === 'maintenance' ? 'Mantenimiento' : 'Meta'}</span>
                                    </div>
                                    <div className="progress-bar-bg">
                                        <div
                                            className="progress-bar-fill"
                                            style={{
                                                width: `${Math.min(Math.max((Math.abs(user.weights[0].value - latestWeight) / Math.abs(user.weights[0].value - calculateGoal(latestWeight, user.height).target)) * 100, 5), 100)}%`,
                                                background: calculateGoal(latestWeight, user.height).type === 'lose' ? 'var(--gradient-success)' : 'var(--gradient-warning)'
                                            }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="goals-grid">
                                    <div className="goal-stat">
                                        <span className="label">Falta</span>
                                        <span className="value">{calculateGoal(latestWeight, user.height).difference} kg</span>
                                    </div>
                                    <div className="goal-stat">
                                        <span className="label">Progreso</span>
                                        <span className={`value ${calculatePercentageChange(user.weights) < 0 ? 'positive' : 'negative'}`}>
                                            {calculatePercentageChange(user.weights).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="goal-stat">
                                        <span className="label">Peso Ideal</span>
                                        <span className="value-sm">
                                            {calculateIdealWeightRange(user.height).min} - {calculateIdealWeightRange(user.height).max} kg
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats Section */}
                <div className="detail-section">
                    <div className="stats-card card">
                        <h3>Estadísticas</h3>

                        <div className="stats-grid">
                            <div className="stat-box">
                                <span className="stat-box-label">Peso Actual</span>
                                <span className="stat-box-value">{latestWeight.toFixed(1)} kg</span>
                            </div>

                            <div className="stat-box">
                                <span className="stat-box-label">Altura</span>
                                <div className="stat-box-value-container">
                                    {isEditingHeight ? (
                                        <div className="inline-edit">
                                            <input
                                                type="number"
                                                value={newHeight}
                                                onChange={(e) => setNewHeight(e.target.value)}
                                                className="height-input"
                                            />
                                            <button className="btn btn-success btn-sm" onClick={handleUpdateHeight}>✓</button>
                                            <button className="btn btn-danger btn-sm" onClick={() => {
                                                setNewHeight(user.height);
                                                setIsEditingHeight(false);
                                            }}>✗</button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="stat-box-value">{user.height} cm</span>
                                            <button className="btn-edit" onClick={() => setIsEditingHeight(true)}>✎</button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {user.weights.length >= 2 && (
                                <div className="stat-box">
                                    <span className="stat-box-label">Diferencia</span>
                                    <span className={`stat-box-value ${difference > 0 ? 'positive' : difference < 0 ? 'negative' : 'neutral'}`}>
                                        {difference > 0 ? '↓' : difference < 0 ? '↑' : '='} {Math.abs(difference).toFixed(1)} kg
                                    </span>
                                </div>
                            )}

                            <div className="stat-box">
                                <span className="stat-box-label">Registros</span>
                                <span className="stat-box-value">{user.weights.length}</span>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Weight History Section */}
                <div className="detail-section full-width">
                    <div className="history-card card">
                        <div className="history-header">
                            <h3>Historial de Peso</h3>
                        </div>

                        <div className="weight-history-list">
                            {sortedWeights.map((weight, index) => (
                                <div key={index} className="weight-history-item">
                                    <div className="weight-history-info">
                                        <span className="weight-history-date">{formatDate(weight.date)}</span>
                                        <span className="weight-history-value">{weight.value.toFixed(1)} kg</span>
                                    </div>
                                </div>
                            ))}

                            {sortedWeights.length === 0 && (
                                <div className="empty-state">
                                    <p>No hay registros de peso</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetail;
