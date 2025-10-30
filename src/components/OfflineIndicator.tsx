import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { ActivityIndicator } from 'react-native-paper';
import { useExpoSQLiteOperations } from '@/hooks/useExpoSQLiteOperations';
import { setPending } from '@/store/slices/offlineSlice';
import { useRoadmap } from '@/context/roadmap';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/auth';

const OfflineIndicator: React.FC = () => {
  const isOffline = useSelector((state: RootState) => state.offline.isOfflineMode);
  const route = useNavigation();
  const pending = useSelector((state: RootState) => state.offline.pending);
  const { user } = useAuth()
  const { refresh, getCashPayments } = useRoadmap()
  const dispatch = useDispatch();
  const { getSyncStats } = useExpoSQLiteOperations()

  const getFreshData = () => {
    try {
      refresh()
      getCashPayments()
    } catch (error) {
    }
  }

  useEffect(() => {
    if (!isOffline && user?.id) {
      getSyncStats().then((stats) => {
        if (pending > 0 && stats.pending === 0) {
          getFreshData()
        }
        dispatch(setPending(stats.pending));
      }).catch((error) => {
        console.log("error", error);
      });
    }
  }, [isOffline, user]);

  if (!isOffline && pending > 0) {
    return (
      <View style={styles.containerPending}>
        <View style={styles.pendingMessage}>
          <ActivityIndicator size={60} />
          <Text style={styles.pendingMessageTitle}>Espere por favor:</Text>
          <Text style={styles.pendingMessageText}>
            Sincronizando... ({pending} pendientes)
          </Text>

        </View>
      </View>
    )
  }
  if (isOffline) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.indicator} />
          <Text style={styles.text}>
            Sin conexión a Internet
          </Text>

        </View>
      </View>
    );
  }
  return null
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 16,
    paddingVertical: 8,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  failedText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 8,
    opacity: 0.8,
  },
  containerPending: {
    position: 'absolute',
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  pendingMessage: {
    padding: 20,
    width: "80%",
    height: 200,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: "rgb(43, 43, 43)",

  },
  pendingMessageText: {
    color: "white",
    fontSize: 16,
  },
  pendingMessageTitle: {
    fontSize: 20,
    padding: 10,
    color: "white",
    fontWeight: 'bold',
    marginTop: 20
  }
});

export default OfflineIndicator;
