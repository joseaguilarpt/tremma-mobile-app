import { useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { syncManager } from '../services/syncManager';

export const useAutoSync = () => {
  const isOffline = useSelector((state: RootState) => state.offline.isOfflineMode);
  const isConnected = !isOffline;
  // Sincronizar automáticamente cuando se conecte
  const handleConnectionChange = async () => {
    if (isConnected) {
      console.log('🌐 Conexión detectada, iniciando sincronización...');
      try {
        await syncManager.syncNow();
        console.log('✅ Sincronización automática completada');
      } catch (error) {
        console.error('❌ Error en sincronización automática:', error);
      }
    }
  }

  // Efecto para sincronizar cuando cambie la conexión
  useEffect(() => {
    if (isConnected) {
    handleConnectionChange();
    }
  }, [isConnected]);

  // Sincronización manual
  const syncNow = useCallback(async () => {
    if (isConnected) {
      await syncManager.syncNow();
    } else {
      console.warn('⚠️ No hay conexión para sincronizar');
    }
  }, [isConnected]);

  // Sincronizar tabla específica
  const syncTable = useCallback(async (tableName: string) => {
    if (isConnected) {
      await syncManager.syncTable(tableName);
    } else {
      console.warn('⚠️ No hay conexión para sincronizar');
    }
  }, [isConnected]);

  // Obtener estadísticas
  const getSyncStats = useCallback(async () => {
    return await syncManager.getSyncStats();
  }, []);

  // Limpiar datos antiguos
  const cleanupOldData = useCallback(async (daysToKeep: number = 30) => {
    await syncManager.cleanupOldData(daysToKeep);
  }, []);

  return {
    isConnected,
    syncNow,
    syncTable,
    getSyncStats,
    cleanupOldData,
  };
};

