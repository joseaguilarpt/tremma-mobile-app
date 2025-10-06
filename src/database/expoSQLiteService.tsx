import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { store } from '../store';
import { addOfflineAction } from '../store/slices/offlineSlice';

class ExpoSQLiteService {
  private db: SQLite.SQLiteDatabase | null = null;

  constructor() {
    this.initDatabase();
  }

  private async initDatabase() {
    try {
      this.db = await SQLite.openDatabaseAsync('tremma_offline.db');

      await this.createTables();

    } catch (error) {
      console.error('❌ Error initializing database:', error);
    }
  }

  private async createTables() {
    if (!this.db) return;
    // Tabla de órdenes
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        numero INTEGER,
        codigo_cliente TEXT,
        nombre_cliente TEXT,
        direccion TEXT,
        monto REAL,
        estado TEXT,
        roadmap_id TEXT,
        color TEXT,
        bultos INTEGER,
        hoja_ruta TEXT,
        horario TEXT,
        condicion_pago TEXT,
        secuencia INTEGER,
        latitud REAL,
        longitud REAL,
        bloqueado INTEGER DEFAULT 0,
        is_synced INTEGER DEFAULT 0,
        motivo TEXT,
        completado BOOLEAN DEFAULT FALSE,
        created_at INTEGER,
        updated_at INTEGER
      );
    `);

    // Tabla de roadmaps
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS roadmaps (
        id TEXT PRIMARY KEY,
        numero TEXT,
        roadmap_id TEXT,
        es_gam INTEGER DEFAULT 0,
        total_pedidos INTEGER,
        total_clientes INTEGER,
        total_bultos INTEGER,
        total_credito REAL,
        total_monto REAL,
        fecha_entrega INTEGER,
        estado TEXT,
        ruta TEXT,
        color TEXT,
        conductor TEXT,
        vehiculo TEXT,
        total_contado REAL,
        is_synced INTEGER DEFAULT 0,
        created_at INTEGER,
        updated_at INTEGER
      );
    `);

    // Tabla de pagos
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS payments (
        id TEXT PRIMARY KEY,
        metodo_pago_id INTEGER,
        metodo_pago_descripcion TEXT,
        pedido_id TEXT,
        monto REAL,
        observaciones TEXT,
        imagen TEXT,
        usuario TEXT,
        comprobante TEXT,
        is_synced INTEGER DEFAULT 0,
        created_at INTEGER,
        updated_at INTEGER
      );
    `);

    // Tabla de mensajes
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        message_id TEXT,
        user_envia_id TEXT,
        user_envia_nombre TEXT,
        user_envia_apellido1 TEXT,
        user_envia_apellido2 TEXT,
        user_envia_login TEXT,
        user_recibe_id TEXT,
        user_recibe_nombre TEXT,
        user_recibe_apellido1 TEXT,
        user_recibe_apellido2 TEXT,
        user_recibe_login TEXT,
        asunto TEXT,
        fecha TEXT,
        descripcion TEXT,
        estado TEXT,
        mensaje_enviar BOOLEAN DEFAULT FALSE,
        is_synced INTEGER DEFAULT 0,
        created_at INTEGER,
        updated_at INTEGER
      );
    `);

    // Tabla de usuarios
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        nombre TEXT,
        apellido1 TEXT,
        email TEXT,
        apellido2 TEXT,
        login TEXT,
        is_synced INTEGER DEFAULT 0,
        created_at INTEGER,
        updated_at INTEGER
      );
    `);

    // Tabla de devoluciones
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS returns (
        id TEXT PRIMARY KEY,
        return_id INTEGER,
        numero INTEGER,
        numero_pedido INTEGER,
        pedido_id INTEGER,
        hoja_ruta TEXT,
        bultos INTEGER,
        codigo_cliente TEXT,
        productos TEXT,
        nombre_cliente TEXT,
        direccion TEXT,
        horario TEXT,
        estado TEXT,
        observaciones TEXT,
        secuencia INTEGER,
        latitud REAL,
        longitud REAL,
        is_synced INTEGER DEFAULT 0,
        created_at INTEGER,
        updated_at INTEGER
      );
    `);

    // Tabla de métodos de pago
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS payment_methods (
        id TEXT PRIMARY KEY,
        metodo_pago_id INTEGER,
        descripcion TEXT,
        activo INTEGER DEFAULT 1,
        orden INTEGER DEFAULT 0,
        is_synced INTEGER DEFAULT 0,
        created_at INTEGER,
        updated_at INTEGER
      );
    `);

    // Tabla de condiciones de pago
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS payment_conditions (
        id TEXT PRIMARY KEY,
        condicion_pago_id INTEGER,
        descripcion TEXT,
        orden INTEGER DEFAULT 0
      );
    `);

    // Tabla de cola de sincronización
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id TEXT PRIMARY KEY,
        table_name TEXT,
        record_id TEXT,
        operation TEXT,
        data TEXT,
        priority INTEGER,
        retry_count INTEGER DEFAULT 0,
        last_retry INTEGER,
        created_at INTEGER,
        status TEXT DEFAULT 'PENDING'
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS clients (
        id TEXT PRIMARY KEY,
        descripcion TEXT,
        distrito_id TEXT,
        distrito_descripcion TEXT,
        provincia_id TEXT,
        provincia_descripcion TEXT,
        canton_id TEXT,
        canton_descripcion TEXT,
        direccion TEXT,
        observaciones TEXT,
        jornada_continua INTEGER,
        hora_ini1 TEXT,
        hora_fin1 TEXT,
        hora_fin2 TEXT,
        hora_ini2 TEXT,
        es_gam INTEGER,
        latitud REAL,
        longitud REAL,
        secuencia INTEGER,
        codigo TEXT,
        created_at INTEGER,
        updated_at INTEGER
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS images (
        id TEXT PRIMARY KEY,
        image_id TEXT,
        image_data BLOB,
        image_name TEXT,
        image_type TEXT,
        image_size INTEGER,
        created_at INTEGER,
        container_name TEXT,
        updated_at INTEGER,
        is_synced INTEGER DEFAULT 0
      );
    `);

    console.log('✅ Todas las tablas creadas correctamente');
  }

  // Reiniciar completamente la base de datos
  public async resetDatabase(): Promise<void> {
    try {
      console.log('🔄 Reiniciando base de datos...');

      if (this.db) {
        // Cerrar la conexión actual
        await this.db.closeAsync();
        this.db = null;
      }

      // Reabrir la base de datos (esto creará un nuevo archivo si no existe)
      this.db = await SQLite.openDatabaseAsync('tremma_offline.db');

      // Recrear todas las tablas
      await this.createTables();

      console.log('✅ Base de datos reiniciada correctamente');

    } catch (error) {
      console.error('❌ Error reiniciando base de datos:', error);
      throw error;
    }
  }

  // Forzar recreación de tablas (útil para desarrollo)
  public async recreateTables(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      console.log('🔄 Recreando tablas...');

      // Eliminar todas las tablas
      await this.db.execAsync('DROP TABLE IF EXISTS orders');
      await this.db.execAsync('DROP TABLE IF EXISTS roadmaps');
      await this.db.execAsync('DROP TABLE IF EXISTS payments');
      await this.db.execAsync('DROP TABLE IF EXISTS messages');
      await this.db.execAsync('DROP TABLE IF EXISTS users');
      await this.db.execAsync('DROP TABLE IF EXISTS returns');
      await this.db.execAsync('DROP TABLE IF EXISTS clients');
      await this.db.execAsync('DROP TABLE IF EXISTS payment_methods');
      await this.db.execAsync('DROP TABLE IF EXISTS payment_conditions');
      await this.db.execAsync('DROP TABLE IF EXISTS images');
      await this.db.execAsync('DROP TABLE IF EXISTS sync_queue');

      // Recrear tablas
      await this.createTables();

      console.log('✅ Tablas recreadas correctamente');

    } catch (error) {
      console.error('❌ Error recreando tablas:', error);
      throw error;
    }
  }

  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ORDERS

  async updateOrder(id: string, updates: any, operation: string = 'UPDATE'): Promise<any> {
    const now = Date.now();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Construir query dinámicamente
    const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates) as any[];
    values.push(now, 0, id); // updated_at, is_synced, id

    await this.db.runAsync(
      `UPDATE orders SET ${updateFields}, updated_at = ?, is_synced = ? WHERE id = ?`,
      values
    );

    if (updates.is_synced === 0) {
      // Agregar a cola de sincronización
      const currentOrder = await this.getOrderByOrderId(id);
      await this.addToSyncQueue('orders', id, operation, { ...currentOrder, ...updates }, 1);
      store.dispatch(addOfflineAction({
        type: operation,
        table: 'orders',
        data: { ...currentOrder, ...updates },
      }))
    }

    return { id, ...updates };
  }

  async getOrderByOrderId(id: string): Promise<any> {
    if (!this.db) {
      return null;
    }
    const result = await this.db.getFirstAsync('SELECT * FROM orders WHERE id = ?', [id]);

    if (!result) {
      return null;
    }

    const parsedResult = {
      Estado: {
        Id: result.estado,
        Descripcion: result.estado,
      },
      Id: result.id,
      Secuencia: result.secuencia,
      Numero: result.numero,
      Cliente: {
        Codigo: result.codigo_cliente,
      },
      CondicionPago: {
        Id: result.condicion_pago,
        Descripcion: result.condicion_pago,
      },
      Bultos: result.bultos,
      Monto: result.monto,
      HojaRuta: result.hoja_ruta,
    };

    return parsedResult as any;
  }

  async getOrders(): Promise<any[]> {
    if (!this.db) {
      return [];
    }

    const result = await this.db.getAllAsync('SELECT * FROM orders ORDER BY created_at DESC');
    return result.map((row: any) => ({
      id: row.id,
      numero: row.numero,
      codigoCliente: row.codigo_cliente,
      nombreCliente: row.nombre_cliente,
      direccion: row.direccion,
      monto: row.monto,
      estado: row.estado,
      roadmapId: row.roadmap_id,
      color: row.color,
      completado: Boolean(row.completado),
      bultos: row.bultos,
      hojaRuta: row.hoja_ruta,
      horario: row.horario,
      condicionPago: row.condicion_pago,
      secuencia: row.secuencia,
      latitud: row.latitud,
      longitud: row.longitud,
      bloqueado: Boolean(row.bloqueado),
      motivo: row.motivo,
      isSynced: Boolean(row.is_synced),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  // ROADMAPS
  async createRoadmap(roadmapData: any): Promise<any> {
    const id = this.generateId();
    const now = Date.now();

    const roadmap = {
      id,
      ...roadmapData,
      is_synced: 0,
      created_at: now,
      updated_at: now,
    };

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    await this.db.runAsync(
      `INSERT INTO roadmaps (
        id, roadmap_id, numero, es_gam, total_pedidos, total_clientes, total_bultos,
        total_credito, total_monto, fecha_entrega, estado, ruta, color,
        is_synced, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        roadmap.id, roadmap.roadmap_id, roadmap.numero, roadmap.es_gam ? 1 : 0,
        roadmap.total_pedidos, roadmap.total_clientes, roadmap.total_bultos,
        roadmap.total_credito, roadmap.total_monto, roadmap.fecha_entrega,
        roadmap.estado, roadmap.ruta, roadmap.color,
        roadmap.is_synced, roadmap.created_at, roadmap.updated_at
      ]
    );

    return roadmap;
  }

  async updateRoadmap(id: string, updates: any, operation: string = 'UPDATE'): Promise<any> {

    const now = Date.now();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Construir query dinámicamente
    const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates) as any[];
    values.push(now, 0, id); // updated_at, is_synced, id

    await this.db.runAsync(
      `UPDATE roadmaps SET ${updateFields}, updated_at = ?, is_synced = ? WHERE id = ?`,
      values
    );

    if (updates.is_synced === 0) {
    // Agregar a cola de sincronización
      await this.addToSyncQueue('roadmaps', id, operation, updates, 3);
      store.dispatch(addOfflineAction({
        type: operation,
        table: 'roadmaps',
        data: { id, ...updates },
      }))
    }

    return { id, ...updates };

  }

  async getRoadmap(id: string): Promise<any> {
    if (!this.db) {
      return null;
    }

    const result = await this.db.getAllAsync('SELECT * FROM roadmaps WHERE id = ?', [id]);
    return result[0];
  }

  // Procesar y guardar roadmap completo con pedidos anidados
  async processAndSaveRoadmap(roadmapData: any): Promise<any> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    if (!roadmapData) {
      return null;
    }

    const now = Date.now();

    // Extraer datos del roadmap principal
    const roadmap = {
      id: roadmapData?.Id?.toString() || this.generateId(),
      numero: roadmapData.Numero,
      es_gam: roadmapData.EsGam ? 1 : 0,
      total_pedidos: roadmapData.TotalPedidos || 0,
      total_clientes: roadmapData.TotalClientes || 0,
      total_bultos: roadmapData.TotalBultos || 0,
      total_credito: roadmapData.TotalCredito || 0,
      total_monto: roadmapData.TotalMonto || 0,
      fecha_entrega: roadmapData.FechaEntrega ? new Date(roadmapData.FechaEntrega).getTime() : null,
      estado: roadmapData.Estado,
      ruta: roadmapData.Ruta,
      color: roadmapData.Color,
      conductor: roadmapData.Conductor,
      vehiculo: roadmapData.Vehiculo,
      total_contado: roadmapData.TotalContado || 0,
      is_synced: 1, // Datos de API ya están sincronizados
      created_at: now,
      updated_at: now,
    };

    // Verificar si el roadmap existe y tiene cambios locales pendientes
    const existingRoadmap = await this.db.getFirstAsync(
      'SELECT is_synced FROM roadmaps WHERE id = ?',
      [roadmap.id]
    ) as any;

    // Solo sobrescribir si no hay cambios locales pendientes
    if (!existingRoadmap || existingRoadmap.is_synced === 1) {
      // Guardar roadmap principal
      await this.db.runAsync(
        `INSERT OR REPLACE INTO roadmaps (
          id, numero, es_gam, total_pedidos, total_clientes, total_bultos,
          total_credito, total_monto, fecha_entrega, estado, ruta, color,
          conductor, vehiculo, total_contado, is_synced, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          roadmap.id, roadmap.numero, roadmap.es_gam,
          roadmap.total_pedidos, roadmap.total_clientes, roadmap.total_bultos,
          roadmap.total_credito, roadmap.total_monto, roadmap.fecha_entrega,
          roadmap.estado, roadmap.ruta, roadmap.color,
          roadmap.conductor, roadmap.vehiculo, roadmap.total_contado,
          roadmap.is_synced, roadmap.created_at, roadmap.updated_at
        ]
      );
    } else {
      console.log(`⚠️ Roadmap ${roadmap.id} tiene cambios locales pendientes, no sobrescribiendo`);
    }

    // Procesar y guardar pedidos
    if (roadmapData.Pedidos && Array.isArray(roadmapData.Pedidos)) {
      for (const pedido of roadmapData.Pedidos) {
        const order = {
          id: pedido.Id?.toString() || this.generateId(),
          numero: pedido.Numero,
          codigo_cliente: pedido.CodigoCliente,
          nombre_cliente: pedido.NombreCliente,
          direccion: pedido.Direccion,
          monto: pedido.Monto,
          estado: pedido.Estado,
          roadmap_id: roadmap.id,
          color: pedido.Color,
          bultos: pedido.Bultos,
          hoja_ruta: pedido.HojaRuta,
          horario: pedido.Horario,
          condicion_pago: pedido.CondicionPago,
          secuencia: pedido.Secuencia,
          latitud: pedido.Latitud,
          longitud: pedido.Longitud,
          bloqueado: pedido.Bloqueado ? 1 : 0,
          motivo: pedido.Motivo || null,
          is_synced: 1, // Datos de API ya están sincronizados
          created_at: now,
          updated_at: now,
        };

        // Verificar si la orden existe y tiene cambios locales pendientes
        const existingOrder = await this.db.getFirstAsync(
          'SELECT is_synced FROM orders WHERE id = ?',
          [order.id]
        ) as any;

        // Solo sobrescribir si no hay cambios locales pendientes
        if (!existingOrder || existingOrder.is_synced === 1) {
          await this.db.runAsync(
            `INSERT OR REPLACE INTO orders (
              id, numero, codigo_cliente, nombre_cliente, direccion, monto, estado, 
              roadmap_id, color, bultos, hoja_ruta, horario, condicion_pago, 
              secuencia, latitud, longitud, bloqueado, motivo, is_synced, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              order.id, order.numero, order.codigo_cliente, order.nombre_cliente,
              order.direccion, order.monto, order.estado, order.roadmap_id,
              order.color, order.bultos, order.hoja_ruta, order.horario,
              order.condicion_pago, order.secuencia, order.latitud, order.longitud,
              order.bloqueado, order.motivo || null, order.is_synced, order.created_at, order.updated_at
            ]
          );
        } else {
          console.log(`⚠️ Orden ${order.id} tiene cambios locales pendientes, no sobrescribiendo`);
        }
      }
    }

    return roadmap;
  }

  // Obtener roadmap completo con pedidos
  async getRoadmapWithOrders(roadmapId?: string): Promise<any> {
    if (!this.db) {
      return null;
    }

    let roadmapQuery = 'SELECT * FROM roadmaps';
    let roadmapParams: any[] = [];

    if (roadmapId) {
      roadmapQuery += ' WHERE id = ?';
      roadmapParams.push(roadmapId);
    }

    roadmapQuery += ' ORDER BY created_at DESC LIMIT 1';

    const roadmapResult = await this.db.getAllAsync(roadmapQuery, roadmapParams);

    if (roadmapResult.length === 0) {
      return null;
    }

    const roadmap = roadmapResult[0] as any;

    // Obtener pedidos del roadmap
    const ordersResult = await this.db.getAllAsync(
      'SELECT * FROM orders WHERE roadmap_id = ? ORDER BY secuencia ASC',
      [roadmap.id]
    );

    const orders = ordersResult.map((row: any) => ({
      Id: parseInt(row.id),
      Numero: row.numero,
      CodigoCliente: row.codigo_cliente,
      NombreCliente: row.nombre_cliente,
      Direccion: row.direccion,
      Monto: row.monto,
      Estado: row.estado,
      Completado: Boolean(row.completado),
      Color: row.color,
      Bultos: row.bultos,
      HojaRuta: row.hoja_ruta,
      Horario: row.horario,
      CondicionPago: row.condicion_pago,
      Secuencia: row.secuencia,
      Latitud: row.latitud,
      Longitud: row.longitud,
      Bloqueado: Boolean(row.bloqueado),
      Motivo: row.motivo,
    }));

    for (const order of orders) {
      order.Devoluciones = await this.getReturns(order.Id);
    }
    

    // Reconstruir estructura original del roadmap
    return {
      Id: parseInt(roadmap.id),
      Numero: roadmap.numero,
      EsGam: Boolean(roadmap.es_gam),
      TotalPedidos: roadmap.total_pedidos,
      TotalClientes: roadmap.total_clientes,
      TotalBultos: roadmap.total_bultos,
      TotalCredito: roadmap.total_credito,
      TotalMonto: roadmap.total_monto,
      FechaEntrega: roadmap.fecha_entrega ? new Date(roadmap.fecha_entrega).toISOString() : null,
      Estado: roadmap.estado,
      Ruta: roadmap.ruta,
      Color: roadmap.color,
      Conductor: roadmap.conductor,
      Vehiculo: roadmap.vehiculo,
      TotalContado: roadmap.total_contado,
      Pedidos: orders,
    };
  }

  // PAYMENTS

  async createPayments(paymentsData: any[], addToSyncQueue: boolean = true): Promise<any[]> {
    const now = Date.now();
    const payments = paymentsData.map((paymentData) => ({
      ...paymentData,
      created_at: now,
      updated_at: now,
      is_synced: 1,
    }));

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Ejecutar de forma secuencial para evitar bloqueos
    for (const payment of payments) {
      await this.createPayment(payment, 'CREATE_PAYMENT', addToSyncQueue);
    }

    return payments;
  }
  async createPayment(paymentData: any, operation: string = 'CREATE', addToSyncQueue: boolean = true): Promise<any> {
    const id = this.generateId();
    const now = Date.now();

    const payment = {
      id: paymentData.Id || paymentData.id || id,
      is_synced: paymentData.isSynced || paymentData.is_synced || 0,
      observaciones: paymentData.Observaciones || paymentData.observaciones || null,
      pedido_id: paymentData.PedidoId || paymentData.pedidoId || null,
      monto: paymentData.Monto || paymentData.monto || null,
      comprobante: paymentData.Comprobante || paymentData.comprobante || null,
      usuario: paymentData.Usuario || paymentData.usuario || null,
      imagen: paymentData.Imagen || paymentData.imagen || null,
      metodo_pago_id: paymentData.MetodoPago?.Id || paymentData.metodoPago.id || null,
      metodo_pago_descripcion: paymentData.MetodoPago?.Descripcion || paymentData.metodoPago.descripcion || null,
      created_at: now,
      updated_at: now,
    };

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    await this.db.runAsync(
      `INSERT INTO payments (
        id, metodo_pago_id, metodo_pago_descripcion, pedido_id, monto,
        observaciones, imagen, usuario, comprobante, is_synced, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payment.id, payment.metodo_pago_id, payment.metodo_pago_descripcion,
        payment.pedido_id, payment.monto, payment.observaciones,
        payment.imagen, payment.usuario, payment.comprobante,
        payment.is_synced, payment.created_at, payment.updated_at
      ]
    );
    console.log("addToSyncQueue", addToSyncQueue);

    if (addToSyncQueue) {
      await this.addToSyncQueue('payments', payment.id, operation, payment, 1);
      store.dispatch(addOfflineAction({
        type: operation,
        table: 'payments',
        data: payment,
      }))
    }

    return payment;
  }

  async deletePaymentById(id: string, operation: string = 'DELETE_PAYMENT', addToSyncQueue: boolean = true): Promise<any> {
    await this.db.runAsync('DELETE FROM payments WHERE id = ?', [id]);
    if (addToSyncQueue) {
      await this.addToSyncQueue('payments', id, operation, { id }, 1);
      store.dispatch(addOfflineAction({
        type: operation,
        table: 'payments',
        data: { id },
      }))
    }
  }

  async updatePayment(paymentData: any, operation: string = 'UPDATE'): Promise<any> {
    const now = Date.now();
    if (!this.db) {
      throw new Error('Database not initialized');
    }


    const payment = {
      id: paymentData.id,
      metodo_pago_id: paymentData.metodoPago.id,
      metodo_pago_descripcion: paymentData.metodoPago.descripcion,
      pedido_id: paymentData.pedidoId,
      monto: paymentData.monto,
      observaciones: paymentData.observaciones,
      imagen: paymentData.imagen,
      usuario: paymentData.usuario,
      comprobante: paymentData.comprobante,
      is_synced: paymentData.isSynced,
      created_at: now,
      updated_at: now,
    };


    await this.db.runAsync(
      `UPDATE payments SET metodo_pago_id = ?, metodo_pago_descripcion = ?, pedido_id = ?, monto = ?, observaciones = ?, imagen = ?, usuario = ?, comprobante = ?, is_synced = ?, created_at = ?, updated_at = ? WHERE id = ?`,
      [payment.metodo_pago_id, payment.metodo_pago_descripcion, payment.pedido_id, payment.monto, payment.observaciones, payment.imagen, payment.usuario, payment.comprobante, payment.is_synced, payment.created_at, payment.updated_at, payment.id]
    );

    await this.addToSyncQueue('payments', paymentData.id, operation, payment, 1);
    store.dispatch(addOfflineAction({
      type: operation,
      table: 'payments',
      data: payment,
    }))

    return paymentData;
  }

  async getPayments(orderId?: string, paymentId?: string[]): Promise<any[]> {
    if (!this.db) {
      return [];
    }

    let query = 'SELECT * FROM payments';
    let params: any[] = [];
    let conditions: string[] = [];

    if (orderId) {
      conditions.push('pedido_id = ?');
      params.push(orderId);
    }

    if (paymentId && paymentId.length > 0) {
      const placeholders = paymentId.map(() => '?').join(',');
      conditions.push(`id IN (${placeholders})`);
      params.push(...paymentId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.db.getAllAsync(query, params);
    const parsedResult = result.map((row: any) => ({
      Id: row.id,
      "PedidoId": row.pedido_id,
      "Monto": row.monto,
      Comprobante: row.comprobante,
      Observaciones: row.observaciones,
      Usuario: row.usuario,
      Imagen: row.imagen,
      MetodoPago: {
        Id: row.metodo_pago_id,
        Descripcion: row.metodo_pago_descripcion,
      }
    }))
    return parsedResult;
  }
  // MESSAGES
  async createMessage(messageData: any): Promise<any> {
    const id = this.generateId();
    const now = Date.now();

    // Procesar estructura anidada del payload
    const message = {
      id,
      message_id: null, // Se asignará cuando se sincronice con la API
      user_envia_id: messageData.userEnvia?.id?.toString(),
      user_envia_nombre: messageData.userEnvia?.nombre,
      user_envia_apellido1: messageData.userEnvia?.apellido1,
      user_envia_apellido2: messageData.userEnvia?.apellido2,
      user_envia_login: messageData.userEnvia?.login,
      user_recibe_id: messageData.userRecibe?.id?.toString(),
      user_recibe_nombre: messageData.userRecibe?.nombre,
      user_recibe_apellido1: messageData.userRecibe?.apellido1,
      user_recibe_apellido2: messageData.userRecibe?.apellido2,
      user_recibe_login: messageData.userRecibe?.login,
      mensaje_enviar: Boolean(messageData.mensaje_enviar),
      asunto: messageData.asunto,
      fecha: messageData.fecha, // Mantener como string ISO
      descripcion: messageData.descripcion,
      estado: messageData.estado || 'Pendiente',
      is_synced: 0,
      created_at: now,
      updated_at: now,
    };

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    await this.db.runAsync(
      `INSERT INTO messages (
        id, message_id, user_envia_id, user_envia_nombre, user_envia_apellido1, user_envia_apellido2, user_envia_login,
        user_recibe_id, user_recibe_nombre, user_recibe_apellido1, user_recibe_apellido2, user_recibe_login,
        asunto, fecha, descripcion, estado, is_synced, created_at, updated_at, mensaje_enviar
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        message.id, message.message_id,
        message.user_envia_id, message.user_envia_nombre, message.user_envia_apellido1, message.user_envia_apellido2, message.user_envia_login,
        message.user_recibe_id, message.user_recibe_nombre, message.user_recibe_apellido1, message.user_recibe_apellido2, message.user_recibe_login,
        message.asunto, message.fecha, message.descripcion, message.estado,
        message.is_synced, message.created_at, message.updated_at, message.mensaje_enviar
      ]
    );

    await this.addToSyncQueue('messages', id, 'CREATE_MESSAGE', messageData, 2);

    store.dispatch(addOfflineAction({
      type: 'CREATE_MESSAGE',
      table: 'messages',
      data: message,
    }));

    return message;
  }

  async getMessages(): Promise<any[]> {
    if (!this.db) {
      return [];
    }

    const result = await this.db.getAllAsync('SELECT * FROM messages ORDER BY created_at DESC');
    const results = result.map((row: any) => ({
      Id: row.id,
      MessageId: row.message_id,
      UserEnvia: {
        Id: row.user_envia_id,
        Nombre: row.user_envia_nombre,
        Apellido1: row.user_envia_apellido1,
        Apellido2: row.user_envia_apellido2,
        Login: row.user_envia_login,
      },
      UserRecibe: {
        Id: row.user_recibe_id,
        Nombre: row.user_recibe_nombre,
        Apellido1: row.user_recibe_apellido1,
        Apellido2: row.user_recibe_apellido2,
        Login: row.user_recibe_login,
      },
      Asunto: row.asunto,
      Fecha: row.fecha,
      Descripcion: row.descripcion,
      Estado: row.estado,
      isSynced: Boolean(row.is_synced),
      CreatedAt: row.created_at,
      UpdatedAt: row.updated_at,
      MensajeEnviar: Boolean(row.mensaje_enviar),
    }));
    return results ?? [];
  }

  // Procesar y guardar mensajes desde la API
  async processAndSaveMessages(messagesData: any[]): Promise<any[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const now = Date.now();
    const processedMessages = [];

    for (const messageData of messagesData) {
      const message = {
        id: messageData.Id?.toString() || this.generateId(),
        message_id: messageData.Id?.toString(),
        user_envia_id: messageData.UserEnvia?.Id?.toString(),
        user_envia_nombre: messageData.UserEnvia?.Nombre,
        user_envia_apellido1: messageData.UserEnvia?.Apellido1,
        user_envia_apellido2: messageData.UserEnvia?.Apellido2,
        user_envia_login: messageData.UserEnvia?.Login,
        user_recibe_id: messageData.UserRecibe?.Id?.toString(),
        user_recibe_nombre: messageData.UserRecibe?.Nombre,
        user_recibe_apellido1: messageData.UserRecibe?.Apellido1,
        user_recibe_apellido2: messageData.UserRecibe?.Apellido2,
        user_recibe_login: messageData.UserRecibe?.Login,
        asunto: messageData.Asunto,
        fecha: messageData.Fecha ? messageData.Fecha : null,
        descripcion: messageData.Descripcion,
        estado: messageData.Estado || "Pendiente",
        is_synced: 1, // Datos de API ya están sincronizados
        created_at: now,
        updated_at: now,
      };

      // Verificar si el mensaje existe y tiene cambios locales pendientes
      const existingMessage = await this.db.getFirstAsync(
        'SELECT is_synced FROM messages WHERE id = ?',
        [message.id]
      ) as any;

      // Solo sobrescribir si no hay cambios locales pendientes
      if (!existingMessage || existingMessage.is_synced === 1) {
        await this.db.runAsync(
          `INSERT OR REPLACE INTO messages (
            id, message_id, user_envia_id, user_envia_nombre, user_envia_apellido1, user_envia_apellido2, user_envia_login,
            user_recibe_id, user_recibe_nombre, user_recibe_apellido1, user_recibe_apellido2, user_recibe_login,
            asunto, fecha, descripcion, estado, is_synced, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            message.id, message.message_id,
            message.user_envia_id, message.user_envia_nombre, message.user_envia_apellido1, message.user_envia_apellido2, message.user_envia_login,
            message.user_recibe_id, message.user_recibe_nombre, message.user_recibe_apellido1, message.user_recibe_apellido2, message.user_recibe_login,
            message.asunto, message.fecha, message.descripcion,
            message.estado, message.is_synced, message.created_at, message.updated_at
          ]
        );
      } else {
        console.log(`⚠️ Mensaje ${message.id} tiene cambios locales pendientes, no sobrescribiendo`);
      }

      processedMessages.push(message);
    }

    return processedMessages;
  }

  async getMessageById(id: string): Promise<any> {
    if (!this.db) {
      return null;
    }

    const result = await this.db.getFirstAsync('SELECT * FROM messages WHERE id = ?', [id]) as any;
    const parsedResult = {
      Id: result.id,
      MessageId: result.message_id,
      UserEnvia: {
        Id: result.user_envia_id,
        Nombre: result.user_envia_nombre,
        Apellido1: result.user_envia_apellido1,
        Apellido2: result.user_envia_apellido2,
        Login: result.user_envia_login,
      },
      UserRecibe: {
        Id: result.user_recibe_id,
        Nombre: result.user_recibe_nombre,
        Apellido1: result.user_recibe_apellido1,
        Apellido2: result.user_recibe_apellido2,
        Login: result.user_recibe_login,
      },
      Asunto: result.asunto,
      Fecha: result.fecha,
      Descripcion: result.descripcion,
      Estado: result.estado,
      isSynced: Boolean(result.is_synced),
      CreatedAt: result.created_at,
      UpdatedAt: result.updated_at,
    }
    return parsedResult;
  }

  async deleteMessage(id: string): Promise<any> { 
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    await this.db.runAsync('DELETE FROM messages WHERE id = ?', [id]);
    return { id };
  }
  async updateMessage(id: string, updates: any, operation: string = 'UPDATE_MESSAGE'): Promise<any> {

    const now = Date.now();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Construir query dinámicamente
    const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates) as any[];
    values.push(now, 0, id); // updated_at, is_synced, id

    await this.db.runAsync(
      `UPDATE messages SET ${updateFields}, updated_at = ?, is_synced = ? WHERE id = ?`,
      values
    );

    // Agregar a cola de sincronización
    await this.addToSyncQueue('messages', id, operation, { ...updates, id }, 3);

    store.dispatch(addOfflineAction({
      type: operation,
      table: 'messages',
      data: { id, ...updates },
    }));

    return { id, ...updates };

  }

  // CLIENTS

  async postClientsList(clientsData: any[]): Promise<any> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    for (const clientData of clientsData) {
      await this.createClient(clientData);
    }
  }
  async createClient(clientData: any): Promise<any> {
    const id = this.generateId();
    const now = Date.now();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const client = {
      id,
      distrito_id: clientData.Distrito?.Id?.toString(),
      distrito_descripcion: clientData.Distrito?.Descripcion,
      provincia_id: clientData.Distrito?.Canton?.Provincia?.Id?.toString(),
      provincia_descripcion: clientData.Distrito?.Canton?.Provincia?.Descripcion,
      canton_id: clientData.Distrito?.Canton?.Id?.toString(),
      canton_descripcion: clientData.Distrito?.Canton?.Descripcion,
      direccion: clientData.Datos?.Direccion,
      observaciones: clientData.Datos?.Observaciones,
      jornada_continua: clientData.Datos?.JornadaContinua ? 1 : 0,
      hora_ini1: clientData.Datos?.HoraIni1,
      hora_fin1: clientData.Datos?.HoraFin1,
      hora_fin2: clientData.Datos?.HoraFin2,
      hora_ini2: clientData.Datos?.HoraIni2,
      es_gam: clientData.Datos?.EsGAM ? 1 : 0,
      latitud: clientData.Datos?.Latitud,
      longitud: clientData.Datos?.Longitud,
      secuencia: clientData.Secuencia,
      codigo: clientData.Codigo,
      descripcion: clientData.Descripcion,
      created_at: now,
      updated_at: now,
    };

    await this.db.runAsync(
      `INSERT INTO clients (
        id, codigo, descripcion, distrito_id, distrito_descripcion, provincia_id, provincia_descripcion, canton_id, canton_descripcion, direccion, observaciones, jornada_continua, hora_ini1, hora_fin1, hora_fin2, hora_ini2, es_gam, latitud, longitud, secuencia, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        client.id, client.codigo, client.descripcion, client.distrito_id, client.distrito_descripcion, client.provincia_id, client.provincia_descripcion, client.canton_id, client.canton_descripcion, client.direccion, client.observaciones, client.jornada_continua, client.hora_ini1, client.hora_fin1, client.hora_fin2, client.hora_ini2, client.es_gam, client.latitud, client.longitud, client.secuencia, client.created_at, client.updated_at
      ]
    );

    return client;
  }

  async getClientById(id: string): Promise<any> {
    if (!this.db) {
      return null;
    }
    const result = await this.db.getFirstAsync('SELECT * FROM clients WHERE codigo = ?', [id]) as any;
    if (!result) {
      return null;
    }

    const parsedResult = {
      Id: result.id,
      Codigo: result.codigo,
      Descripcion: result.descripcion,
      Distrito: {
        Id: result.distrito_id,
        Descripcion: result.distrito_descripcion,
        Canton: {
          Provincia: {
            Id: result.provincia_id,
            Descripcion: result.provincia_descripcion,
          },
          Id: result.canton_id,
          Descripcion: result.canton_descripcion,
        }
      },
      Datos: {
        Direccion: result.direccion,
        Observaciones: result.observaciones,
        JornadaContinua: result.jornada_continua ? 1 : 0,
        HoraIni1: result.hora_ini1,
        HoraFin1: result.hora_fin1,
        EsGAM: result.es_gam ? 1 : 0,
        Latitud: result.latitud,
        Longitud: result.longitud,
      },
      Secuencia: result.secuencia,
      isSynced: Boolean(result.is_synced),
      CreatedAt: result.created_at,
      UpdatedAt: result.updated_at,
    };

    return parsedResult;
  }

  // USERS

  async createUsers(userData: any[]): Promise<any[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    // check if users already exist
    const existingUsers = await this.db.getAllAsync('SELECT * FROM users');
    const usersToCreate = userData.filter((user) => !existingUsers.some((existingUser) => existingUser.user_id === user.user_id));
    if (usersToCreate.length > 0) {
      for (const user of usersToCreate) {
        await this.createUser(user);
      }
    }
    return usersToCreate;
  }

  async createUser(userData: any): Promise<any> {
    const now = Date.now();

    const user = {
      ...userData,
      id: this.generateId(),
      user_id: userData.Id?.toString(),
      nombre: userData.Nombre,
      apellido1: userData.Apellido1,
      apellido2: userData.Apellido2,
      email: userData.Email,
      login: userData.Login,
      is_synced: 0,
      created_at: now,
      updated_at: now,
    };

    /*
            id TEXT PRIMARY KEY,
        user_id TEXT,
        nombre TEXT,
        apellido1 TEXT,
        apellido2 TEXT,
        login TEXT,
        is_synced INTEGER DEFAULT 0,
        created_at INTEGER,
        updated_at INTEGER
    */

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    await this.db.runAsync(
      `INSERT INTO users (
        id, user_id, nombre, apellido1, apellido2, email, login, is_synced, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user.id, user.user_id, user.nombre, user.apellido1, user.apellido2,
        user.email, user.login, user.is_synced, user.created_at, user.updated_at
      ]
    );

    return user;
  }

  async getUsers(payload: { Descripcion: string }): Promise<any[]> {
    if (!this.db) {
      return [];
    }

    let result = await this.db.getAllAsync('SELECT * FROM users ORDER BY created_at DESC');
    if (payload.Descripcion) {
      result = result.filter((user) => {
        const desc = payload.Descripcion.toLowerCase();
        const params = [user.nombre.toLowerCase(), user.apellido1.toLowerCase(), user.apellido2.toLowerCase()];
        return params.some((param) => param.includes(desc));
      });
    }
    return result.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      nombre: row.nombre,
      apellido1: row.apellido1,
      apellido2: row.apellido2,
      login: row.login,
      isSynced: Boolean(row.is_synced),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      Id: row.user_id,
      Nombre: row.nombre,
      Apellido1: row.apellido1,
      Apellido2: row.apellido2,
      Login: row.login,
      Email: row.email,
      NombreCompleto: `${row.nombre} ${row.apellido1} ${row.apellido2}`,
    }));
    /*
        {
      "Email": "ivanjosu@hotmail.com",
      "Tercerizado": true,
      "Roles": [
        {
          "Id": 3,
          "Nombre": "USER-C",
          "Descripcion": "CONDUCTOR",
          "Orden": 2
        }
      ],
      "TipoIdentificacion": {
        "Mascara": "909990999",
        "Orden": 1,
        "Id": 1,
        "Descripcion": "CÉDULA FÍSICA"
      },
      "NombreCompleto": "IVAN JOSUE HERNÁNDEZ ULATE",
      "Id": 85,
      "Nombre": "IVAN JOSUE",
      "Apellido1": "HERNÁNDEZ",
      "Apellido2": "ULATE",
      "Login": "402170107"
    }
    */
  }

  // RETURNS

  async createReturns(returnsData: any[]) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
   
    for (const returnData of returnsData) {
      const payload = {
        id: this.generateId(),
        return_id: returnData.Id,
        numero: returnData.Numero,
        numero_pedido: returnData.NumeroPedido,
        pedido_id: returnData.PedidoId,
        hoja_ruta: returnData.HojaRuta,
        bultos: returnData.Bultos,
        productos: returnData.Productos ? String(returnData.Productos) : null,
        codigo_cliente: returnData.CodigoCliente,
        nombre_cliente: returnData.NombreCliente,
        direccion: returnData.Direccion,
        horario: returnData.Horario,
        estado: returnData.Estado,
        observaciones: returnData.Observaciones,
        secuencia: returnData.Secuencia,
        latitud: returnData.Latitud,
        longitud: returnData.Longitud,
      }
      console.log(payload, "payload", returnData)
      await this.createReturn(payload);
    }
  }
  async createReturn(returnData: any): Promise<any> {
    const id = this.generateId();
    const now = Date.now();

    const returnItem = {
      id,
      ...returnData,
      is_synced: 0,
      created_at: now,
      updated_at: now,
    };

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Check if return already exists
    const existingReturn = await this.db.getFirstAsync('SELECT * FROM returns WHERE return_id = ?', [returnItem.return_id]);
    console.log("existingReturn", JSON.stringify(existingReturn, null, 2), returnItem.return_id);
    if (existingReturn) {
      return existingReturn;
    }

    await this.db.runAsync(
      `INSERT INTO returns (
        id, numero, numero_pedido, pedido_id, return_id, hoja_ruta, bultos, codigo_cliente, nombre_cliente, productos,
        direccion, horario, estado, observaciones, secuencia, latitud, longitud,
        is_synced, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        returnItem.id, returnItem.numero, returnItem.numero_pedido, returnItem.pedido_id, returnItem.return_id, returnItem.hoja_ruta,
        returnItem.bultos, returnItem.codigo_cliente, returnItem.nombre_cliente, returnItem.productos,
        returnItem.direccion, returnItem.horario, returnItem.estado, returnItem.observaciones,
        returnItem.secuencia, returnItem.latitud, returnItem.longitud,
        returnItem.is_synced, returnItem.created_at, returnItem.updated_at
      ]
    );

    return returnItem;
  }

  async updateReturn(id: string, updates: any, operation: string = 'CLOSE_RETURN'): Promise<any> {
    const now = Date.now();
    const returnItem = {
      ...updates,
      updated_at: now,
    };

    const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates) as any[];
    values.push(now, 0, id); // updated_at, is_synced, id
    console.log("updateReturn", updateFields, values);
    await this.db.runAsync(
      `UPDATE returns SET ${updateFields}, updated_at = ?, is_synced = ? WHERE return_id = ?`,
      values
    );

    if (updates.is_synced === 0) {
      await this.addToSyncQueue('returns', id, operation, updates, 1);
      store.dispatch(addOfflineAction({
        type: operation,
        table: 'returns',
        data: { id, ...updates },
      }));
    }
    return returnItem;
  }

  async getReturns(id: string): Promise<any[]> {
    if (!this.db) {
      return [];
    }

    const result = await this.db.getAllAsync('SELECT * FROM returns WHERE pedido_id = ? ORDER BY created_at DESC', [id]);
    console.log("result", JSON.stringify(result, null, 2));
    return result.map((row: any) => ({
      Id: row.id,
      PedidoId: row.pedido_id,
      Numero: row.numero,
      NumeroPedido: row.numero_pedido,
      ReturnId: row.return_id,
      HojaRuta: row.hoja_ruta,
      Bultos: row.bultos,
      CodigoCliente: row.codigo_cliente,
      Productos: row.productos,
      NombreCliente: row.nombre_cliente,
      Direccion: row.direccion,
      Horario: row.horario,
      Estado: row.estado,
      Observaciones: row.observaciones,
      Secuencia: row.secuencia,
      Latitud: row.latitud,
      Longitud: row.longitud,
      isSynced: Boolean(row.is_synced),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async getReturnById(id: string): Promise<any> {
    if (!this.db) {
      return null;
    }
    const row = await this.db.getFirstAsync('SELECT * FROM returns WHERE return_id = ?', [id]) as any;
    return {
      Id: row.id,
      PedidoId: row.pedido_id,
      Numero: row.numero,
      NumeroPedido: row.numero_pedido,
      ReturnId: row.return_id,
      HojaRuta: row.hoja_ruta,
      Bultos: row.bultos,
      CodigoCliente: row.codigo_cliente,
      NombreCliente: row.nombre_cliente,
      Productos: row.productos,
      Direccion: row.direccion,
      Horario: row.horario,
      Estado: row.estado,
      Observaciones: row.observaciones,
      Secuencia: row.secuencia,
      Latitud: row.latitud,
      Longitud: row.longitud,
      isSynced: Boolean(row.is_synced),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  // PAYMENT METHODS

  async createPaymentConditions(paymentConditionsData: any[]) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    for (const paymentConditionData of paymentConditionsData) {
      await this.createPaymentCondition(paymentConditionData);
    }
  }

  async createPaymentCondition(paymentConditionData: any): Promise<any> {
    const now = Date.now();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    const paymentCondition = {
      id: paymentConditionData.Id?.toString() || this.generateId(),
      condicion_pago_id: paymentConditionData.Id,
      descripcion: paymentConditionData.Descripcion,
      orden: paymentConditionData.Orden,
    };

    // Check if payment condition already exists
    const existingPaymentCondition = await this.db.getFirstAsync('SELECT * FROM payment_conditions WHERE condicion_pago_id = ?', [paymentCondition.condicion_pago_id]);
    if (existingPaymentCondition) {
      return existingPaymentCondition;
    }

    await this.db.runAsync(
      `INSERT INTO payment_conditions (id, condicion_pago_id, descripcion, orden) VALUES (?, ?, ?, ?)`,
      [
        paymentCondition.id, paymentCondition.condicion_pago_id, paymentCondition.descripcion,
        paymentCondition.orden
      ]
    );
  }

  async getPaymentConditions(): Promise<any[]> {
    if (!this.db) {
      return [];
    }
    const result = await this.db.getAllAsync('SELECT * FROM payment_conditions');
    return result.map((row: any) => ({
      Id: row.condicion_pago_id,
      Descripcion: row.descripcion,
      Orden: row.orden,
    }));
  }

  async processAndSavePaymentMethods(paymentMethodsData: any[]): Promise<any[]> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    for (const paymentMethodData of paymentMethodsData) {
      const paymentMethod = {
        id: paymentMethodData.Id?.toString() || this.generateId(),
        metodo_pago_id: paymentMethodData.Id,
        descripcion: paymentMethodData.Descripcion,
        orden: paymentMethodData.Orden,
      };
      await this.createPaymentMethod(paymentMethod);
    }

    return paymentMethodsData;
  }
  async createPaymentMethod(paymentMethodData: any): Promise<any> {
    const id = this.generateId();
    const now = Date.now();

    const paymentMethod = {
      id,
      ...paymentMethodData,
      is_synced: 0,
      created_at: now,
      updated_at: now,
    };

    // Check if payment method already exists
    const existingPaymentMethod = await this.db.getFirstAsync('SELECT * FROM payment_methods WHERE metodo_pago_id = ?', [paymentMethod.metodo_pago_id]);
    if (existingPaymentMethod) {
      return existingPaymentMethod;
    }

    if (!this.db) {
      throw new Error('Database not initialized');
    }



    await this.db.runAsync(
      `INSERT INTO payment_methods (
        id, metodo_pago_id, descripcion, activo, orden, is_synced, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        paymentMethod.id, paymentMethod.metodo_pago_id, paymentMethod.descripcion,
        paymentMethod.activo ? 1 : 0, paymentMethod.orden,
        paymentMethod.is_synced, paymentMethod.created_at, paymentMethod.updated_at
      ]
    );

    return paymentMethod;
  }

  async updatePaymentMethod(id: string, updates: any): Promise<any> {
    const now = Date.now();

    if (!this.db) {
      throw new Error('Database not initialized');
    }

    // Construir query dinámicamente
    const updateFields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updates) as any[];
    values.push(now, 0, id); // updated_at, is_synced, id

    await this.db.runAsync(
      `UPDATE payment_methods SET ${updateFields}, updated_at = ?, is_synced = ? WHERE id = ?`,
      values
    );

    return { id, ...updates };
  }

  async deletePaymentMethod(id: string): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    await this.db.runAsync('DELETE FROM payment_methods WHERE id = ?', [id]);
  }

  async getPaymentMethods(): Promise<any[]> {
    if (!this.db) {
      return [];
    }

    const result = await this.db.getAllAsync('SELECT * FROM payment_methods ORDER BY orden ASC, created_at DESC');
    return result.map((row: any) => ({
      id: row.id,
      Orden: row.orden,
      Id: row.metodo_pago_id,
      Descripcion: row.descripcion,
    }));
  }

  async getActivePaymentMethods(): Promise<any[]> {
    if (!this.db) {
      return [];
    }

    const result = await this.db.getAllAsync(
      'SELECT * FROM payment_methods WHERE activo = 1 ORDER BY orden ASC, created_at DESC'
    );
    return result.map((row: any) => ({
      id: row.id,
      metodoPagoId: row.metodo_pago_id,
      descripcion: row.descripcion,
      activo: Boolean(row.activo),
      orden: row.orden,
      isSynced: Boolean(row.is_synced),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  // IMAGES
  async createImage(imageData: any): Promise<any> {
    const id = this.generateId();
    const now = Date.now();
    
    try {
      // 1. Leer el archivo desde la URI temporal y convertir a Base64
      const base64Data = await FileSystem.readAsStringAsync(imageData.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // 2. Crear el objeto con mapeo correcto
      const image = {
        id,
        image_id: id, // Usar el mismo ID generado
        image_data: base64Data, // Contenido Base64
        image_name: imageData.name, // Nombre original
        image_type: imageData.mimeType, // Tipo MIME
        image_size: imageData.size, // Tamaño en bytes
        container_name: imageData.containerName,
        is_synced: 0,
        created_at: now,
        updated_at: now,
      };

      if (!this.db) {
        throw new Error('Database not initialized');
      }

      // 3. Insertar en la base de datos
      await this.db.runAsync(
        `INSERT INTO images (id, image_id, image_data, image_name, image_type, image_size, container_name, created_at, updated_at, is_synced) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [image.id, image.image_id, image.image_data, image.image_name, image.image_type, image.image_size, image.container_name, image.created_at, image.updated_at, image.is_synced]
      );

      return image.id;

    } catch (error) {
      console.error('❌ Error creando imagen:', error);
      throw error;
    }
  }

  async getImageById(id: string): Promise<any> {
    if (!this.db) {
      return null;
    }
    const result = await this.db.getFirstAsync('SELECT * FROM images WHERE id = ?', [id]);
    return result;
  }

  // SYNC QUEUE
  private async addToSyncQueue(
    tableName: string,
    recordId: string,
    operation: string,
    data: any,
    priority: number
  ): Promise<void> {
    if (!this.db) return;

    const id = this.generateId();
    const now = Date.now();

    await this.db.runAsync(
      `INSERT INTO sync_queue (
        id, table_name, record_id, operation, data, priority, retry_count, last_retry, created_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, tableName, recordId, operation, JSON.stringify(data), priority, 0, 0, now, 'PENDING']
    );
  }

  async getSyncQueue(): Promise<any[]> {
    if (!this.db) {
      console.error("Database not initialized");
      return [];
    }

    const result = await this.db.getAllAsync(
      'SELECT * FROM sync_queue WHERE status = "PENDING" ORDER BY created_at ASC, priority ASC'
    );

    return result.map((row: any) => ({
      id: row.id,
      tableName: row.table_name,
      recordId: row.record_id,
      operation: row.operation,
      data: JSON.parse(row.data),
      priority: row.priority,
      retryCount: row.retry_count,
      lastRetry: row.last_retry,
      createdAt: row.created_at,
      status: row.status,
    }));
  }

  async updateSyncQueueStatus(id: string, status: string, retryCount?: number): Promise<void> {
    if (!this.db) return;

    const now = Date.now();
    if (retryCount !== undefined) {
      await this.db.runAsync(
        'UPDATE sync_queue SET status = ?, retry_count = ?, last_retry = ? WHERE id = ?',
        [status, retryCount, now, id]
      );
    } else {
      await this.db.runAsync(
        'UPDATE sync_queue SET status = ? WHERE id = ?',
        [status, id]
      );
    }
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    if (!this.db) return;

    console.log("removeFromSyncQueue", id);
    await this.db.runAsync('DELETE FROM sync_queue WHERE id = ?', [id]);
  }

  // Método para sincronizar datos desde la API
  async syncFromAPI(tableName: string, apiData: any[]): Promise<void> {
    if (!this.db) return;

    const now = Date.now();

    for (const item of apiData) {
      // Verificar si el registro existe
      const existing = await this.db.getFirstAsync(
        `SELECT id FROM ${tableName} WHERE id = ?`,
        [item.id]
      );

      if (existing) {
        // Actualizar registro existente
        const updateFields = Object.keys(item).map(key => `${key} = ?`).join(', ');
        const values = Object.values(item) as any[];
        values.push(now, 1, item.id); // updated_at, is_synced, id

        await this.db.runAsync(
          `UPDATE ${tableName} SET ${updateFields}, updated_at = ?, is_synced = ? WHERE id = ?`,
          values
        );
      } else {
        // Crear nuevo registro
        const fields = Object.keys(item).join(', ');
        const placeholders = Object.keys(item).map(() => '?').join(', ');
        const values = Object.values(item) as any[];
        values.push(now, now, 1); // created_at, updated_at, is_synced

        await this.db.runAsync(
          `INSERT INTO ${tableName} (${fields}, created_at, updated_at, is_synced) VALUES (${placeholders}, ?, ?, ?)`,
          values
        );
      }
    }
  }

  // Limpiar datos
  async clearAllData(): Promise<void> {
    if (!this.db) return;

    const tables = ['orders', 'roadmaps', 'payments', 'messages', 'users', 'returns', 'payment_methods', 'sync_queue'];

    for (const table of tables) {
      await this.db.runAsync(`DELETE FROM ${table}`);
    }
  }

  // Cerrar base de datos
  async closeDatabase(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export const expoSQLiteService = new ExpoSQLiteService();
export default expoSQLiteService;