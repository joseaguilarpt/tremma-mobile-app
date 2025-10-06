import { expoSQLiteService } from '../database/expoSQLiteService';
import { RootState, store } from '../store';
import { setSyncing, setLastSyncTime, setSyncProgress } from '../store/slices/syncSlice';
import * as ordersApi from '@/api/orders';
import * as paymentsApi from '@/api/payments';
import * as paymentMethodsApi from '@/api/paymentMethods';
import * as orderReturnsApi from '@/api/orderReturns';
import * as messagesApi from '@/api/communication';
import * as usersApi from '@/api/users';
import * as filesApi from '@/api/files';
import { setPending } from '@/store/slices/offlineSlice';
import * as FileSystem from 'expo-file-system';
import { useSelector } from 'react-redux';
import { toLowerCaseKeys } from '@/utils';

class SyncManager {
  private isRunning = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private lastSyncTimes: { [key: string]: number } = {};
  // Sincronizar todos los datos
  public async syncAllData(): Promise<void> {
    const syncQueue = await expoSQLiteService.getSyncQueue();
    for (const item of syncQueue) {
      await this.processSyncItem(item);
    }
  }

  // Procesar un elemento de sincronización
  private async processSyncItem(item: any): Promise<void> {
    const { tableName, operation, data, id } = item;

    switch (tableName) {
      case 'orders':
        await this.processOrderOperation(operation, data, id);
        break;
      case 'roadmaps':
        await this.processRoadmapOperation(operation, data, id);
        break;
      case 'payments':
        await this.processPaymentOperation(operation, data, id);
        break;
      case 'messages':
        await this.processMessageOperation(operation, data, id);
        break;
      case 'returns':
        await this.processReturnOperation(operation, data, id);
        break;
      default:
        console.warn(`Operación no soportada para tabla: ${tableName}`);
    }
  }

  private async updateSyncQueue(queueId: string, status: string = 'COMPLETED'): Promise<void> {
    await expoSQLiteService.updateSyncQueueStatus(queueId, status);
    await expoSQLiteService.removeFromSyncQueue(queueId);
    const syncQueue = await expoSQLiteService.getSyncQueue();
    store.dispatch(setPending(syncQueue.length));
  }

  // Procesar operaciones de órdenes
  private async processOrderOperation(operation: string, data: any, queueId: string): Promise<void> {
    switch (operation) {
      case "MARK_ORDER_AS_COMPLETED":
        await this.updateSyncQueue(queueId);
        break;
      case "MARK_ORDER_AS_LOADED":
        console.log("Mark order as loaded:", data.Id, data);
        await ordersApi.confirmOrderAssignment({ Id: data.roadmap_id, orders: [data.Id] })
        await this.updateSyncQueue(queueId);
        break;
      case "MARK_ORDER_AS_NOT_LOADED":
        await ordersApi.rejectOrderAssignment({
          motivo: data.motivo,
          Id: data.roadmap_id,
          orders: [data.id || data.Id],
        });
        await this.updateSyncQueue(queueId);
        break;
      case "MARK_ORDER_AS_INVALIDATED":
        await ordersApi.invalidateOrderAssignment({
          motivo: data.motivo,
          Id: data.roadmap_id,
          orders: [data.id || data.Id],
        });
        await this.updateSyncQueue(queueId);
        break;
      case "MOVE_ORDER":
        await ordersApi.putMoveOrdersInSameRoadmap({
          hojaRutaId: data.roadmap_id,
          pedidoId: data.id || data.Id,
          secuencia: data.secuencia ?? 1,
        });
        await this.updateSyncQueue(queueId);
        break;
    }
  }

  private async processRoadmapOperation(operation: string, data: any, queueId: string): Promise<void> {
    switch (operation) {
      case "START_ROADMAP":
        await ordersApi.startRoadmap({ Id: data.id || data.Id || data.roadmap_id });
        await this.updateSyncQueue(queueId);
        break;
    }
  }

  // Procesar operaciones de pagos
  private async processPaymentOperation(operation: string, data: any, queueId: string): Promise<void> {
    switch (operation) {
      case "CREATE_PAYMENT":
        try {
          const payload = {
            "metodoPago": { "descripcion": data.metodo_pago_descripcion, "id": data.metodo_pago_id },
            "monto": data.monto,
            "observaciones": data.observaciones,
            "pedidoId": data.pedido_id,
            "usuario": data.usuario,
            "comprobante": data.comprobante,
          }
          if (data.imagen) {
            const image = await expoSQLiteService.getImageById(data.imagen);
            
            // Convertir base64 a formato de archivo temporal
            const tempUri = `${FileSystem.cacheDirectory}temp_${image.image_name}`;
            await FileSystem.writeAsStringAsync(tempUri, image.image_data, {
              encoding: FileSystem.EncodingType.Base64,
            });
            
            // Crear objeto de archivo compatible con postFile
            const fileObject = {
              uri: tempUri,
              name: image.image_name,
              type: image.image_type,
            };
            
            const imageId = await filesApi.postFile(fileObject, image.container_name);
            console.log("Image uploaded successfully:", imageId);
            
            // Limpiar archivo temporal
            await FileSystem.deleteAsync(tempUri, { idempotent: true });
            
            payload.imagen = imageId;
          }
          await paymentsApi.postPayment(payload);
          await expoSQLiteService.deletePaymentById(data.id || data.Id, "DELETE_PAYMENT", false);
          await this.updateSyncQueue(queueId);
        } catch (error) {
          console.error("Error sync payment:", error);
        }
        break;
      case "DELETE_PAYMENT":
        await expoSQLiteService.deletePaymentById(data.id || data.Id, "DELETE_PAYMENT", false);
        await paymentsApi.deletePaymentById({ id: data.id || data.Id });
        await this.updateSyncQueue(queueId);
        break;
      case "UPDATE_PAYMENT":
        await paymentsApi.putPaymentById(data);
        await this.updateSyncQueue(queueId);
        break;
    }
  }

  // Procesar operaciones de mensajes
  private async processMessageOperation(operation: string, data: any, id: string): Promise<void> {
    switch (operation) {
      case "CONFIRM_COMMUNICATION":
        await messagesApi.deleteConfirmCommunication(data.id);
        await expoSQLiteService.deleteMessage(data.id);
        await this.updateSyncQueue(id);
        break;
      case "CREATE_MESSAGE":
        const payload = {
          userEnvia: data.userEnvia,
          userRecibe: data.userRecibe,
          asunto: data.asunto,
          fecha: data.fecha,
          descripcion: data.descripcion,
          confirmado: false,
        };
        
        await messagesApi.postUserMessage(payload);
         await this.updateSyncQueue(id);
        break;
    }
  }

  // Procesar operaciones de devoluciones
  private async processReturnOperation(operation: string, data: any, id: string): Promise<void> {
    switch (operation) {
      case "CLOSE_RETURN":
        await orderReturnsApi.closeOrderReturn({ id: data.return_id, descripcion: data.observaciones });
        await this.updateSyncQueue(id);
        break;
    }
  }

  // Sincronización manual
  public async syncNow(): Promise<void> {
    await this.syncAllData();
  }

  // Obtener estadísticas de sincronización
  public async getSyncStats(): Promise<{
    pending: number;
    failed: number;
    completed: number;
    lastSync: number | null;
  }> {
    const syncQueue = await expoSQLiteService.getSyncQueue();

    return {
      syncQueue: syncQueue,
      pending: syncQueue.filter(item => item.status === 'PENDING').length,
      failed: syncQueue.filter(item => item.status === 'FAILED').length,
      completed: syncQueue.filter(item => item.status === 'COMPLETED').length,
    };
  }

  // Forzar sincronización de una tabla específica
  public async syncTable(tableName: string): Promise<void> {
    // try {
    //   let apiData: any[] = [];

    //   switch (tableName) {
    //     case 'orders':
    //       apiData = await ordersApi.getAllOrders();
    //       break;
    //     case 'users':
    //       apiData = await usersApi.getAllUsers();
    //       break;
    //     case 'payment_methods':
    //       apiData = await paymentMethodsApi.getAllPaymentMethods();
    //       break;
    //     default:
    //       throw new Error(`Tabla no soportada: ${tableName}`);
    //   }

    //   await expoSQLiteService.syncFromAPI(tableName, apiData);
    //   this.lastSyncTimes[tableName] = Date.now();

    //   console.log(`✅ Tabla ${tableName} sincronizada manualmente`);
    // } catch (error) {
    //   console.error(`❌ Error sincronizando tabla ${tableName}:`, error);
    //   throw error;
    // }
  }

  // Limpiar datos antiguos
  public async cleanupOldData(daysToKeep: number = 30): Promise<void> {
    // const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

    // // Limpiar elementos completados de la cola de sincronización
    // const syncQueue = await expoSQLiteService.getSyncQueue();
    // const oldCompleted = syncQueue.filter(
    //   item => item.status === 'COMPLETED' && item.createdAt < cutoffTime
    // );

    // for (const item of oldCompleted) {
    //   await expoSQLiteService.removeFromSyncQueue(item.id);
    // }

    // console.log(`🧹 Limpiados ${oldCompleted.length} elementos antiguos`);
  }
}

export const syncManager = new SyncManager();
export default syncManager;
