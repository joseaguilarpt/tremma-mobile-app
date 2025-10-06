// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
// import { useSelector } from 'react-redux';
// import { RootState } from '../store';
// import { useAutoSync } from '../hooks/useAutoSync';

// const SyncStatusIndicator: React.FC = () => {
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [syncStats, setSyncStats] = useState({
//     pending: 0,
//     failed: 0,
//     completed: 0,
//     lastSync: null as number | null,
//   });
  
//   const { isConnected } = useSelector((state: RootState) => ({
//     isConnected: state.network.isConnected,
//   }));
  
//   const { isSyncing } = useSelector((state: RootState) => ({
//     isSyncing: state.sync.isSyncing,
//   }));

//   const { getSyncStats, syncNow } = useAutoSync();

//   // Actualizar estadísticas cada 5 segundos
//   useEffect(() => {
//     const updateStats = async () => {
//       try {
//         const stats = await getSyncStats();
//         setSyncStats(stats);
//       } catch (error) {
//         console.error('Error getting sync stats:', error);
//       }
//     };

//     updateStats();
//     const interval = setInterval(updateStats, 5000);
    
//     return () => clearInterval(interval);
//   }, [getSyncStats]);

//   const getStatusColor = () => {
//     if (!isConnected) return '#FF6B6B'; // Rojo - Sin conexión
//     if (isSyncing) return '#FFA500'; // Naranja - Sincronizando
//     if (syncStats.failed > 0) return '#FF6B6B'; // Rojo - Errores
//     if (syncStats.pending > 0) return '#FFA500'; // Naranja - Pendientes
//     return '#4ECDC4'; // Verde - Todo sincronizado
//   };

//   const getStatusText = () => {
//     if (!isConnected) return 'Sin conexión';
//     if (isSyncing) return 'Sincronizando...';
//     if (syncStats.failed > 0) return `${syncStats.failed} errores`;
//     if (syncStats.pending > 0) return `${syncStats.pending} pendientes`;
//     return 'Sincronizado';
//   };

//   const formatLastSync = (timestamp: number | null) => {
//     if (!timestamp) return 'Nunca';
    
//     const now = Date.now();
//     const diff = now - timestamp;
//     const minutes = Math.floor(diff / 60000);
    
//     if (minutes < 1) return 'Ahora';
//     if (minutes < 60) return `${minutes}m`;
    
//     const hours = Math.floor(minutes / 60);
//     if (hours < 24) return `${hours}h`;
    
//     const days = Math.floor(hours / 24);
//     return `${days}d`;
//   };

//   const handleSyncPress = async () => {
//     if (isConnected && !isSyncing) {
//       try {
//         await syncNow();
//       } catch (error) {
//         console.error('Error syncing:', error);
//       }
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity
//         style={[styles.statusBar, { backgroundColor: getStatusColor() }]}
//         onPress={() => setIsExpanded(!isExpanded)}
//         disabled={!isConnected}
//       >
//         <View style={styles.statusContent}>
//           <View style={styles.statusIndicator} />
//           <Text style={styles.statusText}>{getStatusText()}</Text>
//           {isConnected && (
//             <Text style={styles.lastSyncText}>
//               Última sync: {formatLastSync(syncStats.lastSync)}
//             </Text>
//           )}
//         </View>
//       </TouchableOpacity>

//       {isExpanded && isConnected && (
//         <Animated.View style={styles.detailsContainer}>
//           <View style={styles.detailsContent}>
//             <Text style={styles.detailsTitle}>Estado de Sincronización</Text>
            
//             <View style={styles.statsRow}>
//               <Text style={styles.statLabel}>Pendientes:</Text>
//               <Text style={[styles.statValue, { color: syncStats.pending > 0 ? '#FFA500' : '#4ECDC4' }]}>
//                 {syncStats.pending}
//               </Text>
//             </View>
            
//             <View style={styles.statsRow}>
//               <Text style={styles.statLabel}>Fallidos:</Text>
//               <Text style={[styles.statValue, { color: syncStats.failed > 0 ? '#FF6B6B' : '#4ECDC4' }]}>
//                 {syncStats.failed}
//               </Text>
//             </View>
            
//             <View style={styles.statsRow}>
//               <Text style={styles.statLabel}>Completados:</Text>
//               <Text style={[styles.statValue, { color: '#4ECDC4' }]}>
//                 {syncStats.completed}
//               </Text>
//             </View>
            
//             <TouchableOpacity
//               style={[styles.syncButton, { opacity: isSyncing ? 0.5 : 1 }]}
//               onPress={handleSyncPress}
//               disabled={isSyncing}
//             >
//               <Text style={styles.syncButtonText}>
//                 {isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </Animated.View>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     zIndex: 1000,
//   },
//   statusBar: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
//   statusContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   statusIndicator: {
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: '#fff',
//     marginRight: 8,
//   },
//   statusText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//     marginRight: 8,
//   },
//   lastSyncText: {
//     color: '#fff',
//     fontSize: 12,
//     opacity: 0.8,
//   },
//   detailsContainer: {
//     backgroundColor: '#fff',
//     borderBottomLeftRadius: 8,
//     borderBottomRightRadius: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   detailsContent: {
//     padding: 16,
//   },
//   detailsTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 12,
//     textAlign: 'center',
//   },
//   statsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   statLabel: {
//     fontSize: 14,
//     color: '#666',
//   },
//   statValue: {
//     fontSize: 14,
//     fontWeight: 'bold',
//   },
//   syncButton: {
//     backgroundColor: '#007AFF',
//     paddingVertical: 8,
//     paddingHorizontal: 16,
//     borderRadius: 6,
//     marginTop: 12,
//   },
//   syncButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
// });

// export default SyncStatusIndicator;

