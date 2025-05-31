export interface Roadmap {
    Ruta: string;
    TotalClientes: number;
    TotalPedidos: number;
    TotalBultos: number;
    TotalCredito: number;
    TotalMonto: number;
    TotalDevoluciones: number;
    Vehiculo: string;
    Id: number;
    Numero: string;
    Fecha: string;
}

export interface Order {
  Id: number;
  Color: string;
  Numero: number;
  Bultos: number;
  HojaRuta: string;
  CodigoCliente: string;
  NombreCliente: string;
  Direccion: string;
  Horario: string;
  Estado: string;
  Observaciones: string;
  CondicionPago: string;
  Monto: number;
  Secuencia: number;
  Latitud: number;
  Longitud: number;
  PedidoId?: number;
  Devoluciones?: Order[];
}
