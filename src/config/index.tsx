const roles = {
  "Perfiles de Usuario": [
    "EditarRol",
    "VerRol",
    "CambiarEstadoRol",
    "ReporteRoles",
    "ReporteUsuariosRoles",
    "VerOpcionesRol",
    "ReporteOpcionesRoles",
    "EditarOpcionesAcciones",
  ],
  Usuarios: [
    "EditarUsuario",
    "VerUsuario",
    "CambiarEstadoUsuario",
    "ReporteUsuarios",
    "AgregarFoto",
    "ResetClave",
  ],
  "Tipos de Identificación": [
    "EditarTipoIdentificacion",
    "VerTipoIdentificacion",
    "CambiarEstadoTipoIdentificacion",
    "ReporteTipoIdentificaciones",
  ],
  Provincias: [
    "EditarProvincia",
    "VerProvincia",
    "CambiarEstadoProvincia",
    "ReporteProvincias",
  ],
  Cantones: [
    "EditarCanton",
    "VerCanton",
    "CambiarEstadoCanton",
    "ReporteCantones",
  ],
  Distritos: [
    "EditarDistrito",
    "VerDistrito",
    "CambiarEstadoDistrito",
    "ReporteDistritos",
  ],
  "Correo Electrónico": ["EditarParametroCorreo"],
  Contraseña: ["EditarParametroClave"],
  Vencimientos: ["EditarParametroVence", "ReporteVencimientoUsuarios"],
  Zonas: ["EditarZona", "VerZona", "CambiarEstadoZona", "ReporteZonas"],
  Clientes: [
    "EditarCliente",
    "VerCliente",
    "CambiarEstadoCliente",
    "ReporteClientes",
  ],
  Productos: [
    "EditarProducto",
    "VerProducto",
    "CambiarEstadoProducto",
    "ReporteProductos",
  ],
  Vehículos: [
    "EditarVehiculo",
    "VerVehiculo",
    "CambiarEstadoVehiculo",
    "ReporteVehiculos",
    null,
  ],
  "Métodos Pago": [
    "EditarMetodoPago",
    "VerMetodoPago",
    "CambiarEstadoMetodoPago",
    "ReporteMetodoPago",
  ],
  Bitácora: ["VerBitacora", "ReporteBitacoras"],
  Pedidos: [
    "VerPedido",
    "EditarPedido",
    "MoverPedido",
    "ReprogramarPedido",
    "AsignarSecuenciaPedido",
    "EliminarPedido",
    "AnularPedido",
    "ReportePedidos",
  ],
  HojaRuta: [
    "VerHojaRuta",
    "ListaActivasHojaRuta",
    "ConsecutivoHojaRuta",
    "ConsultarHojaRuta",
    "ReprogramarNuevaFechaHojaRuta",
    "ReprogramarIntegrarHojaRuta",
    "ManualHojaRuta",
    "AnularHojaRuta",
    "EliminarHojaRuta",
    "ValidarHojaRuta",
    "AsignarHojaRuta",
    "ReporteHojasRuta",
  ],
};

//export const BASE_URL = 'https://arrowtremma.com'

export const BASE_URL =
  "https://tremma-app-desa-ada0dmf5bpfjdafx.eastus2-01.azurewebsites.net";

export const API_URL = `${BASE_URL}/api/api`;

export const TREMMA_REPORT_URL = `${BASE_URL}/rpt/reports`;


export const MAPS_ALSA = "AIzaSyBjNA1C1UEn2eCoilFQgEU2fKTMGA9O_4c"