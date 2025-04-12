import { Model } from "@nozbe/watermelondb";
import { field, relation } from "@nozbe/watermelondb/decorators";

class User extends Model {
  static table = "users";

  @field("user_id") userId!: string;
  @field("nombre") nombre!: string;
  @field("apellido1") apellido1!: string;
  @field("apellido2") apellido2?: string;
  @field("login") login!: string;
}

class Message extends Model {
  static table = "messages";

  @field("message_id") messageId!: string;
  @field("userEnviaId") userEnviaId!: string;
  @field("userRecibeId") userRecibeId!: string;
  @field("asunto") asunto!: string;
  @field("fecha") fecha!: number;
  @field("descripcion") descripcion!: string;

  // Relación con el usuario que envía - usamos nombres diferentes para las relaciones
  @relation("users", "userEnviaId") userEnvia!: User;

  // Relación con el usuario que recibe - usamos nombres diferentes para las relaciones
  @relation("users", "userRecibeId") userRecibe!: User;
}

class Roadmap extends Model {
  static table = "roadmaps";

  @field("numero") numero!: string;
  @field("es_gam") esGAM!: boolean;
  @field("total_pedidos") totalPedidos!: number;
  @field("total_clientes") totalClientes!: number;
  @field("total_bultos") totalBultos!: number;
  @field("total_credito") totalCredito!: number;
  @field("total_monto") totalMonto!: number;
  @field("fecha_entrega") fechaEntrega!: number;
  @field("estado") estado!: string;
  @field("ruta") ruta!: string;
  @field("color") color!: string;
}

class Return extends Model {
  static table = "devoluciones";

  @field("numero") numero!: string;
  @field("numero_pedido") numeroPedido!: string;
  @field("hoja_ruta") hojaRuta!: string;
  @field("bultos") bultos!: number;
  @field("codigo_cliente") codigoCliente!: string;
  @field("nombre_cliente") nombreCliente!: string;
  @field("direccion") direccion!: string;
  @field("horario") horario!: string;
  @field("estado") estado!: string;
  @field("observaciones") observaciones?: string;
  @field("secuencia") secuencia!: number;
  @field("latitud") latitud?: number;
  @field("longitud") longitud?: number;

  @relation("orders", "pedido_id") pedido!: any; // Reemplaza 'any' con el tipo correcto
}

class Order extends Model {
  static table = "pedidos";

  @field("color") color!: string;
  @field("numero") numero!: string;
  @field("bultos") bultos!: number;
  @field("hoja_ruta") hojaRuta!: string;
  @field("codigo_cliente") codigoCliente!: string;
  @field("nombre_cliente") nombreCliente!: string;
  @field("direccion") direccion!: string;
  @field("horario") horario!: string;
  @field("estado") estado!: string;
  @field("condicion_pago") condicionPago!: string;
  @field("monto") monto!: number;
  @field("secuencia") secuencia!: number;
  @field("latitud") latitud?: number;
  @field("longitud") longitud?: number;
  @field("roadmap_id") roadmapId!: string; // Asegúrate de que este campo esté definido

  @relation("roadmaps", "roadmap_id") roadmap!: Roadmap;
}

class Payment extends Model {
  static table = "payments";

  @field("metodo_pago_id") metodoPagoId!: number;
  @field("metodo_pago_descripcion") metodoPagoDescripcion!: string;
  @field("pedido_id") pedidoId!: number;
  @field("monto") monto!: number;
  @field("observaciones") observaciones?: string;
  @field("imagen") imagen?: string;
  @field("usuario") usuario!: string;
  @field("comprobante") comprobante?: string;

  // Getter para obtener el método de pago como objeto
  get metodoPago() {
    return {
      id: this.metodoPagoId,
      descripcion: this.metodoPagoDescripcion,
    };
  }

  // Setter para establecer el método de pago
  set metodoPago(value: { id: number; descripcion: string }) {
    this.update((payment) => {
      payment.metodoPagoId = value.id;
      payment.metodoPagoDescripcion = value.descripcion;
    });
  }

  // Relación con el pedido (si tienes un modelo Pedido)
  @relation("pedidos", "pedido_id") pedido!: any; // Reemplaza 'any' con el tipo de tu modelo Pedido
}

export { Message, User, Roadmap, Return, Order, Payment };
