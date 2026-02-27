// BMI Calculation and Classification Utilities

/**
 * Calculate BMI (Body Mass Index)
 * @param {number} weightKg - Weight in kilograms
 * @param {number} heightCm - Height in centimeters
 * @returns {number} BMI value
 */
export const calculateBMI = (weightKg, heightCm) => {
    if (!weightKg || !heightCm || heightCm === 0) return 0;
    const heightM = heightCm / 100;
    return weightKg / (heightM * heightM);
};

/**
 * Get BMI classification and color
 * @param {number} bmi - BMI value
 * @returns {object} Classification info
 */
export const getBMIClassification = (bmi) => {
    if (bmi < 18.5) {
        return {
            status: 'Bajo Peso',
            color: '#3b82f6',
            gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
        };
    } else if (bmi >= 18.5 && bmi < 25) {
        return {
            status: 'Peso Normal',
            color: '#10b981',
            gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
        };
    } else if (bmi >= 25 && bmi < 30) {
        return {
            status: 'Sobrepeso',
            color: '#f59e0b',
            gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
        };
    } else {
        return {
            status: 'Obesidad',
            color: '#ef4444',
            gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
        };
    }
};

/**
 * Calculate weight difference
 * @param {array} weights - Array of weight records
 * @returns {number} Weight difference (positive = weight loss, negative = weight gain)
 */
export const calculateWeightDifference = (weights) => {
    if (!weights || weights.length < 2) return 0;

    // Sort by date to get the most recent two
    const sorted = [...weights].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = sorted[0].value;
    const previous = sorted[1].value;

    return previous - latest; // Positive = loss, Negative = gain
};

/**
 * Get the latest weight
 * @param {array} weights - Array of weight records
 * @returns {number} Latest weight value
 */
export const getLatestWeight = (weights) => {
    if (!weights || weights.length === 0) return 0;
    const sorted = [...weights].sort((a, b) => new Date(b.date) - new Date(a.date));
    return sorted[0].value;
};

/**
 * Format date to readable string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

/**
 * Calculate total percentage change from first record
 * @param {array} weights - Array of weight records
 * @returns {number} Percentage change (negative = loss, positive = gain)
 */
export const calculatePercentageChange = (weights) => {
    if (!weights || weights.length < 2) return 0;

    // Sort by date ascending (oldest first)
    const sorted = [...weights].sort((a, b) => new Date(a.date) - new Date(b.date));
    const start = sorted[0].value;
    const current = sorted[sorted.length - 1].value;

    return ((current - start) / start) * 100;
};

/**
 * Calculate ideal weight range (BMI 18.5 - 24.9)
 * @param {number} heightCm - Height in centimeters
 * @returns {object} { min: number, max: number }
 */
export const calculateIdealWeightRange = (heightCm) => {
    if (!heightCm || heightCm === 0) return { min: 0, max: 0 };

    const heightM = heightCm / 100;
    const minWeight = 18.5 * (heightM * heightM);
    const maxWeight = 24.9 * (heightM * heightM);

    return {
        min: parseFloat(minWeight.toFixed(1)),
        max: parseFloat(maxWeight.toFixed(1))
    };
};

/**
 * Calculate goal and progress
 * @param {number} currentWeight - Current weight in kg
 * @param {number} heightCm - Height in centimeters
 * @returns {object} Goal info
 */
export const calculateGoal = (currentWeight, heightCm) => {
    if (!currentWeight || !heightCm) return null;

    const bmi = calculateBMI(currentWeight, heightCm);
    const idealRange = calculateIdealWeightRange(heightCm);

    let target = 0;
    let type = 'maintenance'; // 'lose', 'gain', 'maintenance'

    if (bmi < 18.5) {
        target = idealRange.min;
        type = 'gain';
    } else if (bmi > 24.9) {
        target = idealRange.max;
        type = 'lose';
    } else {
        target = currentWeight; // Already in range
        type = 'maintenance';
    }

    const difference = currentWeight - target;

    return {
        target: parseFloat(target.toFixed(1)),
        type,
        difference: parseFloat(Math.abs(difference).toFixed(1)),
        idealRange
    };
};

/**
 * Calculate recommended daily water intake
 * Formula: Weight (kg) * 35ml
 * @param {number} weightKg - Current weight
 * @returns {number} Water in liters
 */
export const calculateDailyWater = (weightKg) => {
    if (!weightKg) return 0;
    return parseFloat(((weightKg * 35) / 1000).toFixed(1));
};

/**
 * Calculate BMR (Basal Metabolic Rate) - Mifflin-St Jeor Equation
 * Simplified estimation (assuming age 30, male/female avg) since we don't have age/gender
 * @param {number} weightKg - Weight
 * @param {number} heightCm - Height
 * @returns {number} Calories
 */
export const calculateBMR = (weightKg, heightCm) => {
    if (!weightKg || !heightCm) return 0;
    // Generic average: (10 * weight) + (6.25 * height) - (5 * age [30]) + 5 [male adj]
    // Using a neutral formula for estimation
    return Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * 30));
};

/**
 * Get a health tip based on BMI status
 * @param {string} bmiStatus - BMI Status string
 * @returns {string} Tip text
 */
const TIPS_LIBRARY = {
    'Bajo Peso': [
        "Añade frutos secos y semillas a tus ensaladas o yogures para aumentar calorías saludables.",
        "Prioriza batidos de proteínas con leche, plátano y mantequilla de maní.",
        "No te saltes el desayuno. Intenta comer 5-6 veces al día en porciones moderadas.",
        "Agrega aceite de oliva extra virgen a tus comidas ya servidas.",
        "Consume grasas saludables como aguacate, salmón y nueces.",
        "Entrenamiento de fuerza (pesas) te ayudará a ganar masa muscular, no solo 'peso'.",
        "Incluye carbohidratos complejos en cada comida: avena, arroz integral, quinoa.",
        "Bebe tus calorías: los jugos naturales y batidos son una forma fácil de sumar energía.",
        "Evita beber mucha agua justo antes de comer para no llenar tu estómago.",
        "El descanso es clave para el crecimiento muscular. Duerme al menos 7-8 horas."
    ],
    'Peso Normal': [
        "Mantén tu rutina actual. ¡Lo estás haciendo excelente!",
        "Prueba una nueva actividad física este mes, como yoga o senderismo.",
        "La hidratación sigue siendo clave, incluso si estás en tu peso ideal.",
        "Prioriza la calidad del sueño para mantener tus niveles hormonales equilibrados.",
        "Limita el consumo de procesados y prioriza alimentos frescos.",
        "Realiza chequeos médicos anuales para verificar tu salud interna.",
        "El equilibrio es la clave: disfruta de tus comidas favoritas con moderación.",
        "Practica 'Mindful Eating': come despacio y disfruta cada bocado.",
        "Incorpora ejercicios de fuerza 2-3 veces por semana para mantenimiento óseo.",
        "Reduce el tiempo frente a pantallas antes de dormir para mejorar tu descanso."
    ],
    'Sobrepeso': [
        "Cambia los refrescos por agua o té sin azúcar. ¡Pequeños cambios suman!",
        "Intenta caminar 30 minutos al día a paso ligero.",
        "Sirve tus comidas en platos más pequeños para controlar las porciones visualmente.",
        "Come más proteínas (pollo, pescado, huevos) para sentir saciedad por más tiempo.",
        "Evita comer frente al televisor o celular para ser consciente de tu ingesta.",
        "Sube escaleras en lugar de usar el elevador siempre que sea posible.",
        "Planifica tus comidas de la semana para evitar compras impulsivas poco saludables.",
        "Duerme bien: la falta de sueño aumenta la hormona del hambre (grelina).",
        "Empieza tus comidas con una ensalada o vegetales para saciarte más rápido.",
        "Reduce el consumo de 'calorías vacías' como el alcohol los fines de semana."
    ],
    'Obesidad': [
        "Enfócate en 'agregar' vegetales, no solo en 'quitar' comida.",
        "El agua antes de las comidas puede ayudar a reducir el apetito de forma natural.",
        "Consulta con un profesional de salud para un plan personalizado y seguro.",
        "Celebra las victorias que no son de peso: más energía, mejor sueño, ropa más holgada.",
        "Evita tener 'snacks' tentadores a la vista en tu cocina o escritorio.",
        "Establece horarios fijos para tus comidas y evita el 'picoteo' constante.",
        "La fibra es tu amiga: frutas enteras, verduras y legumbres te mantienen lleno.",
        "Mueve tu cuerpo de forma suave pero constante: caminar, nadar o bailar.",
        "Lleva un diario de comidas para identificar patrones emocionales al comer.",
        "Rodéate de personas que apoyen tus nuevos hábitos saludables."
    ],
    'General': [
        "La constancia vence a la intensidad. Pequeños pasos cada día.",
        "Tu cuerpo es el único lugar que tienes para vivir. Cuídalo.",
        "No te compares con el progreso de otros, tu camino es único.",
        "Beber agua al despertar activa tu metabolismo y te hidrata.",
        "Escucha a tu cuerpo: come cuando tengas hambre real, para cuando estés satisfecho.",
        "El estrés afecta tu peso. Practica la respiración profunda o meditación.",
        "La salud mental es tan importante como la física. Sé amable contigo mismo.",
        "Haz del ejercicio una celebración de lo que tu cuerpo puede hacer, no un castigo."
    ]
};

/**
 * Get a random health tip based on BMI status
 * @param {string} bmiStatus - BMI Status string
 * @returns {string} Tip text
 */
export const getHealthTip = (bmiStatus) => {
    const specificTips = TIPS_LIBRARY[bmiStatus] || TIPS_LIBRARY['General'];
    const generalTips = TIPS_LIBRARY['General'];

    // 70% chance of specific tip, 30% chance of general tip
    const finalPool = Math.random() > 0.3 ? specificTips : generalTips;

    return finalPool[Math.floor(Math.random() * finalPool.length)];
};
/**
 * Get achievements/badges for a user
 * @param {object} user - User object
 * @returns {array} Array of achievement objects
 */
export const getUserAchievements = (user) => {
    const achievements = [];
    if (!user.weights || user.weights.length === 0) return achievements;

    const weights = user.weights;
    const latestWeight = weights[weights.length - 1].value;

    // 🔥 Constante: Más de 3 registros
    if (weights.length >= 3) {
        achievements.push({
            id: 'constant',
            icon: '🔥',
            label: 'Constante',
            description: 'Más de 3 registros'
        });
    }

    // ⚡ Rayo: Bajó más de 1.5kg en el último registro
    if (weights.length >= 2) {
        const previousWeight = weights[weights.length - 2].value;
        const diff = previousWeight - latestWeight;
        if (diff >= 1.5) {
            achievements.push({
                id: 'fast',
                icon: '⚡',
                label: 'Rayo',
                description: 'Bajó > 1.5kg'
            });
        }

        // ✨ Manteniendo: Diferencia mínima (< 0.2kg)
        if (Math.abs(diff) < 0.2) {
            achievements.push({
                id: 'stable',
                icon: '✨',
                label: 'Estable',
                description: 'Peso mantenido'
            });
        }
    }

    return achievements;
};
