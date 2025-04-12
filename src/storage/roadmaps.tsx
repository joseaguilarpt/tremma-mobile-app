import { Q } from "@nozbe/watermelondb";
import { database } from "./database";

// ===== OPERACIONES DE LECTURA =====

// Obtener todos los roadmaps
export const getAllRoadmapsDB = async () => {
  try {
    const data = await database.get("roadmaps").query().fetch();
    return data;
  } catch (error) {
    console.error("Error al obtener roadmaps:", error);
    return [];
  }
};

// Obtener un roadmap por ID
export const getRoadmapByIdDB = async (roadmapId) => {
  try {
    if (!roadmapId) throw new Error("ID de roadmap no proporcionado");
    const data = await database.get("roadmaps").find(roadmapId);
    return data;
  } catch (error) {
    console.error(`Error al obtener roadmap ${roadmapId}:`, error);
    return null;
  }
};

// Obtener un roadmap por número
export const getRoadmapByNumeroDB = async (numero) => {
  try {
    if (!numero) throw new Error("Número de roadmap no proporcionado");
    
    const data = await database
      .get("roadmaps")
      .query(Q.where("numero", numero))
      .fetch();
    
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error(`Error al obtener roadmap número ${numero}:`, error);
    return null;
  }
};

// Obtener roadmaps por estado
export const getRoadmapsByEstadoDB = async (estado) => {
  try {
    if (!estado) throw new Error("Estado no proporcionado");
    
    const data = await database
      .get("roadmaps")
      .query(Q.where("estado", estado))
      .fetch();
    
    return data;
  } catch (error) {
    console.error(`Error al obtener roadmaps con estado ${estado}:`, error);
    return [];
  }
};

// Obtener roadmaps por rango de fechas
export const getRoadmapsByDateRangeDB = async (startDate, endDate) => {
  try {
    if (!startDate || !endDate) throw new Error("Rango de fechas incompleto");
    
    // Convertir a timestamp si es necesario
    const start = typeof startDate === 'object' ? startDate.getTime() : startDate;
    const end = typeof endDate === 'object' ? endDate.getTime() : endDate;
    
    const data = await database
      .get("roadmaps")
      .query(Q.where("fecha_entrega", Q.between(start, end)))
      .fetch();
    
    return data;
  } catch (error) {
    console.error(`Error al obtener roadmaps por rango de fechas:`, error);
    return [];
  }
};
