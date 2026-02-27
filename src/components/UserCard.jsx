import { calculateWeightDifference, getLatestWeight, formatDate, calculatePercentageChange, getUserAchievements } from '../utils/calculations';
import './UserCard.css';

const UserCard = ({ user, onClick }) => {
    const latestWeight = getLatestWeight(user.weights);
    const difference = calculateWeightDifference(user.weights);
    const percentChange = calculatePercentageChange(user.weights);
    const hasMultipleWeights = user.weights.length >= 2;

    // Get latest date
    const latestDate = user.weights.length > 0
        ? formatDate([...user.weights].sort((a, b) => new Date(b.date) - new Date(a.date))[0].date)
        : 'Sin registro';

    // Motivational "Tough Love" Emoji Logic
    let feelingEmoji = '✨';

    if (percentChange <= -3) feelingEmoji = '🦁'; // Beast mode
    else if (percentChange < 0) feelingEmoji = '🔥'; // On fire / doing good
    else if (percentChange === 0) feelingEmoji = '🐢'; // Slow / Stagnant
    else {
        // Gained weight - Funny/Mocking emojis
        const mockingEmojis = ['🐷', '🍔', '🍕', '🍩', '🛌', '🆘'];
        // Use user ID or name length to make it consistent per user/render but "random" across users
        const emojiIndex = (user.name.length + Math.floor(difference * 10)) % mockingEmojis.length;
        feelingEmoji = mockingEmojis[Math.abs(emojiIndex)];
    }

    const achievements = getUserAchievements(user);

    return (
        <div className="user-card card minimal" onClick={() => onClick(user)}>
            <div className="user-card-header">
                <div className="user-info">
                    <h3 className="user-name">
                        {user.name} <span className="feeling-emoji">{feelingEmoji}</span>
                    </h3>
                </div>
                <div className="user-weight">
                    <span className="weight-value">{latestWeight.toFixed(1)}</span>
                    <span className="weight-unit">kg</span>
                </div>
            </div>
            {achievements.length > 0 && (
                <div className="card-badges">
                    {achievements.map(badge => (
                        <span key={badge.id} className="card-badge" title={badge.description}>
                            {badge.icon}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserCard;
