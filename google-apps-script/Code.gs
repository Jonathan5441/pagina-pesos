/**
 * Google Apps Script para "Reto DAIA"
 * Este script sirve como API backend para la app Monitor de Peso DAIA.
 * 
 * INSTRUCCIONES:
 * 1. Abre tu Google Sheet "Reto DAIA"
 * 2. Ve a Extensiones → Apps Script
 * 3. Borra todo el código que haya y pega este archivo completo
 * 4. Guarda (Ctrl+S)
 * 5. Despliega: Implementar → Nueva implementación
 *    - Tipo: Aplicación web
 *    - Ejecutar como: Yo
 *    - Quién tiene acceso: Cualquier persona
 * 6. Copia la URL y pégala en sheetsService.js
 */

// ============================================
// CONFIGURACIÓN - Ajusta si es necesario
// ============================================
const SHEET_NAME = 'Hoja 1'; // Nombre de la hoja (pestaña). Cámbialo si tu hoja tiene otro nombre.
const ID_COL = 1;            // Columna A = id
const NAME_COL = 2;          // Columna B = name
const HEIGHT_COL_HEADER = 'height'; // Encabezado de la columna de altura

// ============================================
// GET - Obtener todos los usuarios
// ============================================
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return jsonResponse({ error: 'No se encontró la hoja: ' + SHEET_NAME });
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0]; // Primera fila = encabezados
    
    // Encontrar la columna de height
    let heightColIndex = -1;
    for (let i = 0; i < headers.length; i++) {
      if (String(headers[i]).toLowerCase().trim() === HEIGHT_COL_HEADER) {
        heightColIndex = i;
        break;
      }
    }
    
    // Identificar columnas de peso (las que NO son id, name, height)
    // Estas columnas tienen fechas como encabezado
    const weightColumns = [];
    for (let i = 0; i < headers.length; i++) {
      if (i === ID_COL - 1 || i === NAME_COL - 1 || i === heightColIndex) continue;
      
      const header = headers[i];
      const dateStr = parseHeaderDate(header);
      if (dateStr) {
        weightColumns.push({ index: i, date: dateStr });
      }
    }
    
    // Construir array de usuarios
    const users = [];
    for (let row = 1; row < data.length; row++) {
      const id = data[row][ID_COL - 1];
      const name = String(data[row][NAME_COL - 1]).trim();
      const height = heightColIndex >= 0 ? Number(data[row][heightColIndex]) || 165 : 165;
      
      // Saltar filas vacías
      if (!id || !name) continue;
      
      // Recolectar pesos
      const weights = [];
      for (const wc of weightColumns) {
        const rawValue = data[row][wc.index];
        const numValue = parseWeight(rawValue);
        
        if (numValue !== null) {
          weights.push({
            date: wc.date,
            value: numValue
          });
        }
      }
      
      users.push({
        id: Number(id),
        name: name,
        height: height,
        weights: weights
      });
    }
    
    return jsonResponse({ users: users });
    
  } catch (error) {
    return jsonResponse({ error: error.message });
  }
}

// ============================================
// POST - Actualizar datos (altura, peso, etc.)
// ============================================
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      return jsonResponse({ error: 'No se encontró la hoja: ' + SHEET_NAME });
    }
    
    if (action === 'updateHeight') {
      return handleUpdateHeight(sheet, body.userId, body.height);
    }
    
    if (action === 'addWeight') {
      return handleAddWeight(sheet, body.userId, body.date, body.weight);
    }
    
    return jsonResponse({ error: 'Acción no reconocida: ' + action });
    
  } catch (error) {
    return jsonResponse({ error: error.message });
  }
}

// ============================================
// HANDLERS
// ============================================

function handleUpdateHeight(sheet, userId, height) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Encontrar columna height
  let heightColIndex = -1;
  for (let i = 0; i < headers.length; i++) {
    if (String(headers[i]).toLowerCase().trim() === HEIGHT_COL_HEADER) {
      heightColIndex = i;
      break;
    }
  }
  
  if (heightColIndex === -1) {
    return jsonResponse({ error: 'No se encontró la columna de altura' });
  }
  
  // Encontrar la fila del usuario
  for (let row = 1; row < data.length; row++) {
    if (Number(data[row][ID_COL - 1]) === Number(userId)) {
      sheet.getRange(row + 1, heightColIndex + 1).setValue(Number(height));
      return jsonResponse({ success: true, message: 'Altura actualizada' });
    }
  }
  
  return jsonResponse({ error: 'Usuario no encontrado: ' + userId });
}

function handleAddWeight(sheet, userId, dateStr, weight) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  // Buscar si ya existe columna para esta fecha
  let dateColIndex = -1;
  for (let i = 0; i < headers.length; i++) {
    if (parseHeaderDate(headers[i]) === dateStr) {
      dateColIndex = i;
      break;
    }
  }
  
  // Si no existe la columna, crear una nueva antes de height
  if (dateColIndex === -1) {
    let heightColIndex = headers.length - 1;
    for (let i = 0; i < headers.length; i++) {
      if (String(headers[i]).toLowerCase().trim() === HEIGHT_COL_HEADER) {
        heightColIndex = i;
        break;
      }
    }
    
    sheet.insertColumnBefore(heightColIndex + 1);
    sheet.getRange(1, heightColIndex + 1).setValue(dateStr);
    dateColIndex = heightColIndex;
  }
  
  // Encontrar la fila del usuario
  for (let row = 1; row < data.length; row++) {
    if (Number(data[row][ID_COL - 1]) === Number(userId)) {
      sheet.getRange(row + 1, dateColIndex + 1).setValue(Number(weight));
      return jsonResponse({ success: true, message: 'Peso registrado' });
    }
  }
  
  return jsonResponse({ error: 'Usuario no encontrado: ' + userId });
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Parsea el encabezado de fecha de la hoja.
 * Soporta formatos: "PESO 21/01/2026", "21/01/2026", "4/2/2026", Date objects, etc.
 * Retorna string formato "YYYY-MM-DD" o null si no es fecha.
 */
function parseHeaderDate(header) {
  if (!header) return null;
  
  // Si es un objeto Date de Google Sheets
  if (header instanceof Date) {
    return formatDateISO(header);
  }
  
  const headerStr = String(header).trim();
  
  // Intentar extraer fecha del texto (e.g., "PESO 21/01/2026")
  const dateMatch = headerStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10);
    const year = parseInt(dateMatch[3], 10);
    
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
  
  return null;
}

/**
 * Parsea un valor de peso. Maneja números, strings con coma, y valores vacíos/"-".
 */
function parseWeight(value) {
  if (value === null || value === undefined || value === '' || value === '-') {
    return null;
  }
  
  if (typeof value === 'number') {
    return value;
  }
  
  // Reemplazar coma por punto para decimales
  const cleaned = String(value).replace(',', '.').trim();
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? null : num;
}

/**
 * Formatea un Date a "YYYY-MM-DD"
 */
function formatDateISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Retorna una respuesta JSON válida para Apps Script Web App
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
