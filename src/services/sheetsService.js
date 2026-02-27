import { initialUsers } from '../data/initialData';

/**
 * Obtiene los usuarios desde los datos locales
 */
export async function fetchUsers() {
    console.info('📋 Usando datos locales (actualización manual por código)');
    return initialUsers;
}

/**
 * Función placeholder para mantener compatibilidad
 */
export async function updateHeight(userId, height) {
    console.warn('⚠️ La actualización de altura solo funciona localmente en esta sesión.');
    return { success: true };
}

/**
 * Función placeholder para mantener compatibilidad
 */
export async function addWeight(userId, date, weight) {
    console.warn('⚠️ Se detectó intento de registro. Actualiza initialData.js para guardar permanentemente.');
    return { success: true };
}

