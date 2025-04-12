// schema.ts
import { appSchema, tableSchema } from "@nozbe/watermelondb";

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: "messages",
      columns: [
        { name: "id", type: "string" },
        { name: "userEnviaId", type: "string", isIndexed: true },
        { name: "userRecibeId", type: "string", isIndexed: true },
        { name: "asunto", type: "string" },
        { name: "fecha", type: "number" }, // Cambiado a number para timestamp
        { name: "descripcion", type: "string" },
      ],
    }),
    tableSchema({
      name: "users",
      columns: [
        { name: "id", type: "string" },
        { name: "nombre", type: "string" },
        { name: "apellido1", type: "string" },
        { name: "apellido2", type: "string", isOptional: true },
        { name: "login", type: "string" },
      ],
    }),
    tableSchema({
      name: "roadmaps",
      columns: [
        { name: "numero", type: "string" },
        { name: "es_gam", type: "boolean" },
        { name: "total_pedidos", type: "number" },
        { name: "total_clientes", type: "number" },
        { name: "total_bultos", type: "number" },
        { name: "total_credito", type: "number" },
        { name: "total_monto", type: "number" },
        { name: "fecha_entrega", type: "number" }, // Cambiado a number
        { name: "estado", type: "string" },
        { name: "ruta", type: "string" },
        { name: "color", type: "string" },
      ],
    }),
    // Renombrar a "pedidos" para coincidir con el modelo o viceversa
    tableSchema({
      name: "pedidos", // o "orders", pero debe coincidir con tus modelos
      columns: [
        { name: "roadmap_id", type: "string", isIndexed: true },
        { name: "color", type: "string" },
        { name: "numero", type: "number" },
        { name: "bultos", type: "number" },
        { name: "hoja_ruta", type: "string" },
        { name: "codigo_cliente", type: "string" },
        { name: "nombre_cliente", type: "string" },
        { name: "direccion", type: "string" },
        { name: "horario", type: "string" },
        { name: "estado", type: "string" },
        { name: "condicion_pago", type: "string" },
        { name: "monto", type: "number" },
        { name: "secuencia", type: "number" },
        { name: "latitud", type: "number", isOptional: true },
        { name: "longitud", type: "number", isOptional: true },
      ],
    }),
    // Esta tabla parece no alineada con el contexto general
    tableSchema({
      name: "payments",
      columns: [
        // No necesitamos definir 'id' ya que WatermelonDB lo maneja internamente
        { name: "metodo_pago_id", type: "number", isIndexed: true },
        { name: "metodo_pago_descripcion", type: "string" }, // Almacenamos la descripción para acceso rápido
        { name: "pedido_id", type: "number", isIndexed: true },
        { name: "monto", type: "number" },
        { name: "observaciones", type: "string", isOptional: true },
        { name: "imagen", type: "string", isOptional: true },
        { name: "usuario", type: "string" },
        { name: "comprobante", type: "string", isOptional: true },
      ],
    }),
    // Renombrar a "devoluciones" para coincidir con el modelo o viceversa
    tableSchema({
      name: "devoluciones", // o "returns", pero debe coincidir con tus modelos
      columns: [
        { name: "pedido_id", type: "string", isIndexed: true },
        { name: "numero", type: "number" },
        { name: "numero_pedido", type: "number" },
        { name: "hoja_ruta", type: "string" },
        { name: "bultos", type: "number" },
        { name: "codigo_cliente", type: "string" },
        { name: "nombre_cliente", type: "string" },
        { name: "direccion", type: "string" },
        { name: "horario", type: "string" },
        { name: "estado", type: "string" },
        { name: "observaciones", type: "string", isOptional: true },
        { name: "secuencia", type: "number" },
        { name: "latitud", type: "number", isOptional: true },
        { name: "longitud", type: "number", isOptional: true },
      ],
    }),
  ],
});
