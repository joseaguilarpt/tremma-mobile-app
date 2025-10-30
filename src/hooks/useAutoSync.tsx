import { useEffect, useCallback, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { syncManager } from '../services/syncManager';
import { expoSQLiteService } from '../database/expoSQLiteService';
import { useAuth } from '@/context/auth';

export const useAutoSync = (cb: () => void) => {
  const isOffline = useSelector((state: RootState) => state.offline.isOfflineMode);
  const { user} = useAuth()
  const isLoggedIn = user?.id;
  const isConnected = !isOffline;
  const [tablesInitialized, setTablesInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const hasSyncedRef = useRef(false);

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
  const handleConnectionChange = useCallback(async () => {
    if (!isLoggedIn) return;
    // Si ya se sincronizó, no hacerlo de nuevo
    if (hasSyncedRef.current) {
      return;
    }

    if (isConnected && tablesInitialized) {
      console.log('🌐 Conexión detectada, iniciando sincronización...');
      hasSyncedRef.current = true;
      try {
        await syncManager.syncNow();
        console.log('✅ Sincronización automática completada');
        cb()
      } catch (error) {
        console.error('❌ Error en sincronización automática:', error);
        hasSyncedRef.current = false; // Resetear en caso de error para permitir reintentar
      }
    } else if (isConnected && !tablesInitialized) {
      console.log('⏳ Esperando inicialización de tablas antes de sincronizar...');
      // Esperar a que las tablas se inicialicen
      const tablesReady = await expoSQLiteService.waitForTablesInitialization();
      if (tablesReady) {
        setTablesInitialized(true);
        console.log('🌐 Tablas inicializadas, iniciando sincronización...');
        hasSyncedRef.current = true;
        try {
          await syncManager.syncNow();
          console.log('✅ Sincronización automática completada');
          cb();
        } catch (error) {
          console.error('❌ Error en sincronización automática:', error);
          hasSyncedRef.current = false; // Resetear en caso de error para permitir reintentar
        }
      }
    }
  }, [isConnected, tablesInitialized, isLoggedIn]);

  // Efecto para verificar inicialización de tablas al montar el componente
  useEffect(() => {
    checkTablesInitialization();
  }, [checkTablesInitialization]);

  // Efecto para sincronizar cuando cambie la conexión
  useEffect(() => {
    if (isConnected && !isInitializing) {
      handleConnectionChange();
    }
    // Resetear el flag cuando se desconecta
    if (!isConnected) {
      hasSyncedRef.current = false;
    }
  }, [isConnected, isInitializing, handleConnectionChange, isLoggedIn]);

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

