import { useEffect, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { syncManager } from '../services/syncManager';
import { expoSQLiteService } from '../database/expoSQLiteService';

export const useAutoSync = () => {
  const isOffline = useSelector((state: RootState) => state.offline.isOfflineMode);
  const isConnected = !isOffline;
  const [tablesInitialized, setTablesInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Verificar estado de inicialización de tablas
  const checkTablesInitialization = useCallback(async () => {
    try {
      const initialized = await expoSQLiteService.areTablesInitialized();
      setTablesInitialized(initialized);
      setIsInitializing(false);
      return initialized;
    } catch (error) {
      console.error('❌ Error verificando inicialización de tablas:', error);
      setTablesInitialized(false);
      setIsInitializing(false);
      return false;
    }
  }, []);

  // Sincronizar automáticamente cuando se conecte
  const handleConnectionChange = async () => {
    if (isConnected && tablesInitialized) {
      console.log('🌐 Conexión detectada, iniciando sincronización...');
      try {
        await syncManager.syncNow();
        console.log('✅ Sincronización automática completada');
      } catch (error) {
        console.error('❌ Error en sincronización automática:', error);
      }
    } else if (isConnected && !tablesInitialized) {
      console.log('⏳ Esperando inicialización de tablas antes de sincronizar...');
      // Esperar a que las tablas se inicialicen
      const tablesReady = await expoSQLiteService.waitForTablesInitialization();
      if (tablesReady) {
        setTablesInitialized(true);
        console.log('🌐 Tablas inicializadas, iniciando sincronización...');
        try {
          await syncManager.syncNow();
          console.log('✅ Sincronización automática completada');
        } catch (error) {
          console.error('❌ Error en sincronización automática:', error);
        }
      }
    }
  }

  // Efecto para verificar inicialización de tablas al montar el componente
  useEffect(() => {
    checkTablesInitialization();
  }, [checkTablesInitialization]);

  // Efecto para sincronizar cuando cambie la conexión
  useEffect(() => {
    if (isConnected && !isInitializing) {
      handleConnectionChange();
    }
  }, [isConnected, tablesInitialized, isInitializing]);

  // Sincronización manual
  const syncNow = useCallback(async () => {
    if (isConnected) {
      if (!tablesInitialized) {
        console.log('⏳ Esperando inicialización de tablas...');
        const tablesReady = await expoSQLiteService.waitForTablesInitialization();
        if (!tablesReady) {
          console.error('❌ No se pueden sincronizar los datos: las tablas no están inicializadas');
          return;
        }
        setTablesInitialized(true);
      }
      await syncManager.syncNow();
    } else {
      console.warn('⚠️ No hay conexión para sincronizar');
    }
  }, [isConnected, tablesInitialized]);

  // Sincronizar tabla específica
  const syncTable = useCallback(async (tableName: string) => {
    if (isConnected) {
      if (!tablesInitialized) {
        console.log('⏳ Esperando inicialización de tablas...');
        const tablesReady = await expoSQLiteService.waitForTablesInitialization();
        if (!tablesReady) {
          console.error('❌ No se pueden sincronizar los datos: las tablas no están inicializadas');
          return;
        }
        setTablesInitialized(true);
      }
      await syncManager.syncTable(tableName);
    } else {
      console.warn('⚠️ No hay conexión para sincronizar');
    }
  }, [isConnected, tablesInitialized]);

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
    tablesInitialized,
    isInitializing,
    syncNow,
    syncTable,
    getSyncStats,
    cleanupOldData,
    checkTablesInitialization,
  };
};

