import { Q } from "@nozbe/watermelondb";
import { database } from "./database";

// Obtener todos los mensajes
export const getAllMessagesDB = async () => {
  try {
    const data = await database.get("messages").query().fetch();
    return data;
  } catch (error) {
    console.error("Error al obtener mensajes:", error);
    return [];
  }
};

// Obtener un mensaje por ID
export const getMessageDB = async (messageId) => {
  try {
    if (!messageId) throw new Error("ID de mensaje no proporcionado");
    const data = await database.get("messages").find(messageId);
    return data;
  } catch (error) {
    console.error(`Error al obtener mensaje ${messageId}:`, error);
    return null;
  }
};

// Buscar mensajes por asunto
export const getFilteredMessagesDB = async (keyword) => {
  try {
    if (!keyword) return await getAllMessagesDB();
    
    const data = await database
      .get("messages")
      .query(Q.where("asunto", Q.like(`%${keyword}%`)))
      .fetch();
    return data;
  } catch (error) {
    console.error(`Error al filtrar mensajes por "${keyword}":`, error);
    return [];
  }
};

// Obtener mensajes recibidos por un usuario
export const getReceivedMessagesDB = async (userId) => {
  try {
    if (!userId) throw new Error("ID de usuario no proporcionado");
    
    const data = await database
      .get("messages")
      .query(Q.where("userRecibeId", userId))
      .fetch();
    return data;
  } catch (error) {
    console.error(`Error al obtener mensajes recibidos para usuario ${userId}:`, error);
    return [];
  }
};

// Obtener mensajes enviados por un usuario
export const getSentMessagesDB = async (userId) => {
  try {
    if (!userId) throw new Error("ID de usuario no proporcionado");
    
    const data = await database
      .get("messages")
      .query(Q.where("userEnviaId", userId))
      .fetch();
    return data;
  } catch (error) {
    console.error(`Error al obtener mensajes enviados para usuario ${userId}:`, error);
    return [];
  }
};

// Crear un nuevo mensaje
export const createMessageDB = async (messageData) => {
  try {
    let newMessage;
    await database.write(async () => {
      newMessage = await database.get("messages").create(message => {
        message.userEnviaId = messageData.userEnviaId;
        message.userRecibeId = messageData.userRecibeId;
        message.asunto = messageData.asunto;
        message.descripcion = messageData.descripcion;
        message.fecha = new Date().toISOString();
      });
    });
    return newMessage;
  } catch (error) {
    console.error("Error al crear mensaje:", error);
    return null;
  }
};
