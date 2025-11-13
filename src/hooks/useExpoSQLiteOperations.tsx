import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { expoSQLiteService } from '../database/expoSQLiteService';
import { syncManager } from '../services/syncManager';
import * as ordersApi from '@/api/orders';
import * as roadmapApi from '@/api/roadmap';
import * as paymentsApi from '@/api/payments';
import * as paymentMethodsApi from '@/api/paymentMethods';
import * as messagesApi from '@/api/communication';
import * as usersApi from '@/api/users';
import * as clientsApi from '@/api/clients';
import * as filesApi from '@/api/files';
import * as orderReturnsApi from '@/api/orderReturns';
import { dayCR } from '@/utils/dates';

export const useExpoSQLiteOperations = () => {
  const isOffline = useSelector((state: RootState) => state.offline.isOfflineMode);


  // Operaciones de Orders

  const moveOrdersInSameRoadmap = useCallback(async (roadmapId: string, payload: any) => {
    if (!isOffline) {
      await ordersApi.putMoveOrdersInSameRoadmap({
        hojaRutaId: roadmapId,
        pedidoId: payload.id || payload.Id,
        secuencia: payload.secuencia ?? 1,
      });
    }
    await expoSQLiteService.updateOrder(payload.id || payload.Id, { roadmap_id: roadmapId, secuencia: payload.secuencia ?? 1, is_synced: isOffline ? 0 : 1 }, "MOVE_ORDER");
  }, [isOffline]);

  const getOrders = useCallback(async () => {
    if (isOffline) {
      return await expoSQLiteService.getOrders();
    } else {
      return await ordersApi.getAllOrders();
    }
  }, [isOffline]);

  const getOrderById = useCallback(async (id: string) => {
    if (isOffline) {
      return await expoSQLiteService.getOrderByOrderId(id);
    } else {
      return await ordersApi.getOrderById(id);
    }
  }, [isOffline]);

  const markOrderAsCompleted = useCallback(async (roadmapId: string, payload: any) => {
    await expoSQLiteService.updateOrder(payload.id || payload.Id, { estado: "Completado", roadmap_id: roadmapId, completado: true, is_synced: isOffline ? 0 : 1 }, "MARK_ORDER_AS_COMPLETED");
  }, [isOffline]);

  const markOrderAsLoaded = useCallback(async (roadmapId: string, payload: any) => {
    if (!isOffline) {
      await ordersApi.confirmOrderAssignment({ Id: roadmapId, orders: [payload.id] });
    }
    await expoSQLiteService.updateOrder(payload.id, { roadmap_id: roadmapId, estado: "Cargado", is_synced: isOffline ? 0 : 1 }, "MARK_ORDER_AS_LOADED");
  }, [isOffline]);

  const markOrderAsNotLoaded = useCallback(async (roadmapId: string, payload: any) => {
    if (!isOffline) {
      await ordersApi.rejectOrderAssignment({
        motivo: payload.motivo,
        Id: roadmapId,
        orders: [payload.id],
      });
    }
    await expoSQLiteService.updateOrder(payload.id, { roadmap_id: roadmapId, motivo: payload.motivo, estado: "No Cargado", is_synced: isOffline ? 0 : 1 }, "MARK_ORDER_AS_NOT_LOADED");
  }, [isOffline]);

  const markOrderAsInvalidated = useCallback(async (roadmapId: string, payload: any) => {
    if (!isOffline) {
      await ordersApi.invalidateOrderAssignment({
        motivo: payload.motivo,
        Id: roadmapId,
        orders: [payload.id],
      });
    }
    await expoSQLiteService.updateOrder(payload.id, { roadmap_id: roadmapId, motivo: payload.motivo, estado: "Anulado", bloqueado: 1, is_synced: isOffline ? 0 : 1 }, "MARK_ORDER_AS_INVALIDATED");
  }, [isOffline]);

  // Operaciones de Clients
  const postClientsList = useCallback(async (clientsData: any[]) => {
    await expoSQLiteService.postClientsList(clientsData);
  }, [isOffline]);

  const getClientById = useCallback(async (id: string) => {
    if (isOffline) {
      return await expoSQLiteService.getClientById(id);
    } else {
      return await clientsApi.getClientById(id);
    }
  }, [isOffline]);

  const mergeOrders = (orders = [], dbOrders = []) => {
    if (!Array.isArray(orders)) return [];
    const safeDbOrders = Array.isArray(dbOrders) ? dbOrders : [];
    return orders.map((order) => {
      if (!order) return order;
      const existent = safeDbOrders.find((item) => (order?.Id ?? order?.id) === (item?.Id ?? item?.id));
      if (existent) {
        return {
          ...order,
          Estado: existent?.Estado ?? order?.Estado,
          estado: existent?.estado ?? order?.estado,
        };
      }
      return order;
    });
  }


  // Operaciones de Roadmaps
  const getRoadmap = useCallback(async () => {
    try {
      if (isOffline) {
        return await expoSQLiteService.getRoadmapWithOrders();
      } else {
        const roadmapData = await ordersApi.getCurrentRoadmap();
        if (roadmapData) {
          const db =  await expoSQLiteService.getRoadmapWithOrders();
          const mergedOrders = mergeOrders(roadmapData?.Pedidos || [], db?.Pedidos || [])
          roadmapData.Pedidos = mergedOrders;
        }
        await expoSQLiteService.processAndSaveRoadmap(roadmapData);
        return roadmapData;
      }
    } catch (error) {
      console.error("Error getting roadmap:", error);

      // Si hay error, intentar reiniciar la base de datos
      try {
        console.log("🔄 Intentando reiniciar base de datos...");
        await expoSQLiteService.resetDatabase();

        // Intentar nuevamente
        if (isOffline) {
          return await expoSQLiteService.getRoadmapWithOrders();
        } else {
          const roadmapData = await ordersApi.getCurrentRoadmap();
          if (roadmapData) {
            await expoSQLiteService.processAndSaveRoadmap(roadmapData);
          }
          return roadmapData;
        }
      } catch (retryError) {
        console.error("Error en reintento:", retryError);
        throw retryError;
      }
    }
  }, [isOffline]);

  const startRoadmap = useCallback(async (roadmapId: string) => {
    if (!isOffline) {
      await ordersApi.startRoadmap({ Id: roadmapId });
    }
    await expoSQLiteService.updateRoadmap(roadmapId, { roadmap_id: roadmapId, estado: "Iniciado", is_synced: isOffline ? 0 : 1 }, "START_ROADMAP");
  }, [isOffline]);

  // Operaciones de Payments

  const createPaymentConditions = useCallback(async (paymentConditionsData: any[]) => {
    return await expoSQLiteService.createPaymentConditions(paymentConditionsData);
  }, [isOffline]);

  const getPaymentConditions = useCallback(async () => {
    if (isOffline) {
      return await expoSQLiteService.getPaymentConditions();
    } else {
      const paymentConditions = await roadmapApi.getPaymentConditions();
      await expoSQLiteService.createPaymentConditions(paymentConditions);
      return paymentConditions;
    }
  }, [isOffline]);

  const createPayment = useCallback(async (paymentData: any) => {
    console.log("createPayment", paymentData);
    if (!isOffline) {
      await paymentsApi.postPayment(paymentData);
    }
    return await expoSQLiteService.createPayment({ ...paymentData, isSynced: isOffline ? 0 : 1 }, "CREATE_PAYMENT", isOffline);

  }, [isOffline]);

  const deletePayment = useCallback(async (paymentData: any) => {
    if (!isOffline) {
      await paymentsApi.deletePaymentById(paymentData);
    }
    return await expoSQLiteService.deletePaymentById(paymentData.id, "DELETE_PAYMENT");
  }, [isOffline]);

  const updatePayment = useCallback(async (paymentData: any) => {
    if (!isOffline) {
      await paymentsApi.putPaymentById(paymentData);
    }
    return await expoSQLiteService.updatePayment({ ...paymentData, isSynced: isOffline ? 0 : 1 }, "UPDATE_PAYMENT");
  }, [isOffline]);

  const getPayments = useCallback(async (orderId?: string) => {
    if (!isOffline) {
      const payments = await paymentsApi.getPaymentListByOrderId(orderId);
      const paymentIds = payments.map((payment) => payment.Id);
      const existingPayments = await expoSQLiteService.getPayments(orderId, paymentIds);
      const paymentsToCreate = payments.filter((payment) => !existingPayments.some((existingPayment) => existingPayment.id === payment.id));
      if (paymentsToCreate.length > 0) {
        await expoSQLiteService.createPayments(paymentsToCreate, false);
      }
      return payments;
    }
    return await expoSQLiteService.getPayments(orderId);
  }, [isOffline]);

  // Operaciones de Messages
  const createMessage = useCallback(async (messageData: any) => {
    if (isOffline) {
      return await expoSQLiteService.createMessage({ ...messageData, estado: "PorEnviar", is_synced: 0, mensaje_enviar: true });
    } else {
      return await messagesApi.postUserMessage(messageData);
    }
  }, [isOffline]);

  const getMessages = useCallback(async (userId?: string) => {
    let messages = [];
    if (!isOffline) {
      messages = await messagesApi.getCommunications({ userId: userId });
      try {
        const filtered = messages.filter(item => {
          if (!item.Fecha) return false;
          if (item.Estado === "Confirmado") return false;
          const limitDate = dayCR().subtract(5, "days")
          return dayCR(item.Fecha).isAfter(limitDate)
        })
        await expoSQLiteService.processAndSaveMessages(filtered);

      } catch (error) {
        console.error("Error processing messages:", error);
      }
    }
    if (isOffline) {
      try {
        messages = await expoSQLiteService.getMessages()
        const filtered = messages.filter(item => {
          if (item.MensajeEnviar) return false;
          if (!item.Fecha) return false;
          if (item.Estado === "Confirmado") return false;
          const limitDate = dayCR().subtract(5, "days")
          return dayCR(item.Fecha).isAfter(limitDate)
        })
        return filtered;
      } catch (error) {
        console.error("Error getting messages:", error);
      }
    }
    return messages;
  }, [isOffline]);

  const deleteConfirmCommunication = useCallback(async (id: string) => {
    if (!isOffline) {
      await messagesApi.deleteConfirmCommunication(id);
    }
    await expoSQLiteService.updateMessage(id, { estado: "Confirmado", is_synced: isOffline ? 0 : 1 }, "CONFIRM_COMMUNICATION");
  }, [isOffline]);

  const getMessageById = useCallback(async (id: string) => {
    if (isOffline) {
      return await expoSQLiteService.getMessageById(id);
    } else {
      return await messagesApi.getCommunicationById(id);
    }
  }, [isOffline]);

  // Operaciones de Users

  const createUsers = useCallback(async (userData: any[]) => {
    if (isOffline) {
      return await expoSQLiteService.createUsers(userData);
    }
  }, [isOffline]);
  const createUser = useCallback(async (userData: any) => {
    if (isOffline) {
      return await expoSQLiteService.createUser(userData);
    }
  }, [isOffline]);

  const getUsers = useCallback(async (payload: any) => {
    if (!isOffline) {
      const { Items = [] } = await usersApi.getUsersList(payload);
      if (Items.length > 0) {
        await expoSQLiteService.createUsers(Items);
      }
      return { Items };
    }
    if (isOffline) {
      const users = await expoSQLiteService.getUsers(payload);
      return { Items: users };
    }
  }, [isOffline]);

  // Operaciones de Returns

  const createReturns = useCallback(async (returnsData: any[]) => {
    if (!isOffline) {
      return await expoSQLiteService.createReturns(returnsData);
    }
  }, [isOffline]);

  const createReturn = useCallback(async (returnData: any) => {
    if (!isOffline) {
      return await expoSQLiteService.createReturn(returnData);
    }
  }, [isOffline]);

  const getReturns = useCallback(async (id: string) => {
    if (isOffline) {
      return await expoSQLiteService.getReturns(id);
    } else {
      // Implementar API call cuando esté disponible
      return [];
    }
  }, [isOffline]);

  const getReturnById = useCallback(async (id: string) => {
    if (isOffline) {
      return await expoSQLiteService.getReturnById(id);
    } else {
      return await orderReturnsApi.getReturnById(id);
    }
  }, [isOffline]);

  const closeReturn = useCallback(async (id: string, descripcion: string) => {
    if (!isOffline) {
      await orderReturnsApi.closeOrderReturn({
        id,
        descripcion
      });
    } 
    return await expoSQLiteService.updateReturn(id, { return_id: id, estado: "Cerrado", observaciones: descripcion, is_synced: isOffline ? 0 : 1 }, "CLOSE_RETURN");
  }, [isOffline]);
  // Operaciones de Payment Methods
  const createPaymentMethod = useCallback(async (paymentMethodData: any) => {
    if (isOffline) {
      return await expoSQLiteService.createPaymentMethod(paymentMethodData);
    } else {
      return await paymentMethodsApi.postPaymentMethod(paymentMethodData);
    }
  }, [isOffline]);

  const updatePaymentMethod = useCallback(async (id: string, updates: any) => {
    if (isOffline) {
      return await expoSQLiteService.updatePaymentMethod(id, updates);
    } else {
      return await paymentMethodsApi.putPaymentMethodById({ id, ...updates });
    }
  }, [isOffline]);

  const deletePaymentMethod = useCallback(async (id: string) => {
    if (isOffline) {
      return await expoSQLiteService.deletePaymentMethod(id);
    } else {
      return await paymentMethodsApi.enableOrDisablePaymentMethod(id);
    }
  }, [isOffline]);

  const getPaymentMethods = useCallback(async () => {
    if (isOffline) {
      return await expoSQLiteService.getPaymentMethods();
    } else {
      const paymentMethods = await paymentMethodsApi.getPaymentMethodList();
      await expoSQLiteService.processAndSavePaymentMethods(paymentMethods);
      return paymentMethods;
    }
  }, [isOffline]);

  const getActivePaymentMethods = useCallback(async () => {
    if (isOffline) {
      return await expoSQLiteService.getActivePaymentMethods();
    } else {
      const allMethods = await paymentMethodsApi.getAllPaymentMethods();
      return allMethods.filter((method: any) => method.activo);
    }
  }, [isOffline]);

  // Operaciones de Images
  const postImage = useCallback(async (imageData: any, containerName: string = "comprobantesdata") => {
    if (isOffline) {
      return await expoSQLiteService.createImage({ ...imageData, containerName });
    } else {
      return await filesApi.postFile(imageData, containerName);
    }
  }, [isOffline]);

  // Operaciones de sincronización
  const syncNow = useCallback(async () => {
    if (!isOffline) {
      await syncManager.syncNow();
    }
  }, [isOffline]);

  const getSyncStats = useCallback(async () => {
    return await syncManager.getSyncStats();
  }, []);

  // Sincronizar tabla específica
  const syncTable = useCallback(async (tableName: string) => {
    if (!isOffline) {
      await syncManager.syncTable(tableName);
    }
  }, [isOffline]);

  // Limpiar datos antiguos
  const cleanupOldData = useCallback(async (daysToKeep: number = 30) => {
    await syncManager.cleanupOldData(daysToKeep);
  }, []);

  // Operaciones de administración
  const clearAllData = useCallback(async () => {
    await expoSQLiteService.clearAllData();
  }, []);

  const closeDatabase = useCallback(async () => {
    await expoSQLiteService.closeDatabase();
  }, []);

  // Funciones de administración de base de datos
  const resetDatabase = useCallback(async () => {
    await expoSQLiteService.resetDatabase();
  }, []);

  const recreateTables = useCallback(async () => {
    await expoSQLiteService.recreateTables();
  }, []);

  return {
    // Orders
    getOrders,
    markOrderAsLoaded,
    markOrderAsNotLoaded,
    markOrderAsInvalidated,
    markOrderAsCompleted,
    moveOrdersInSameRoadmap,
    getOrderById,
    // Roadmaps
    getRoadmap,
    startRoadmap,

    // Payments
    createPayment,
    getPayments,
    updatePayment,
    deletePayment,

    // Messages
    createMessage,
    getMessages,
    deleteConfirmCommunication,
    getMessageById,

    // Clients
    postClientsList,
    getClientById,
    // Users
    createUser,
    getUsers,
    createUsers,

    // Returns
    createReturn,
    createReturns,
    getReturns,
    getReturnById,
    closeReturn,

    // Payment Methods
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    getPaymentMethods,
    getActivePaymentMethods,

    // Payment Conditions
    createPaymentConditions,
    getPaymentConditions,

    // Sync
    syncNow,
    getSyncStats,
    syncTable,
    cleanupOldData,

    // Admin
    clearAllData,
    closeDatabase,
    resetDatabase,
    recreateTables,

    // Images
    postImage,

    // State
    isOffline,
  };
};
