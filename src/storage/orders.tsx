import { Q } from "@nozbe/watermelondb";
import { database } from "./database";

// ===== OPERACIONES DE LECTURA =====

// Obtener todos los pedidos
export const getAllPedidosDB = async () => {
  try {
    const data = await database.get("pedidos").query().fetch();
    return data;
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    return [];
  }
};

// Obtener un pedido por ID
export const getPedidoByIdDB = async (pedidoId) => {
  try {
    if (!pedidoId) throw new Error("ID de pedido no proporcionado");
    const data = await database.get("pedidos").find(pedidoId);
    return data;
  } catch (error) {
    console.error(`Error al obtener pedido ${pedidoId}:`, error);
    return null;
  }
};

// Obtener un pedido por número
export const getPedidoByNumeroDB = async (numero) => {
  try {
    if (!numero) throw new Error("Número de pedido no proporcionado");
    
    const data = await database
      .get("pedidos")
      .query(Q.where("numero", numero))
      .fetch();
    
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error(`Error al obtener pedido número ${numero}:`, error);
    return null;
  }
};

// Obtener pedidos de un roadmap específico
export const getPedidosByRoadmapDB = async (roadmapId) => {
  try {
    if (!roadmapId) throw new Error("ID de roadmap no proporcionado");
    
    const data = await database
      .get("pedidos")
      .query(Q.where("roadmap_id", roadmapId))
      .fetch();
    
    return data;
  } catch (error) {
    console.error(`Error al obtener pedidos del roadmap ${roadmapId}:`, error);
    return [];
  }
};

// Obtener pedidos por estado
export const getPedidosByEstadoDB = async (estado) => {
  try {
    if (!estado) throw new Error("Estado no proporcionado");
    
    const data = await database
      .get("pedidos")
      .query(Q.where("estado", estado))
      .fetch();
    
    return data;
  } catch (error) {
    console.error(`Error al obtener pedidos con estado ${estado}:`, error);
    return [];
  }
};
