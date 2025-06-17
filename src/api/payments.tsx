import api from "./api";
import { decodeMenuItems } from "./dashboard";

const encodeParams = (params: Record<string, any>): string => {
  return Object.entries(params)
    .filter(
      ([_, value]) => value !== undefined && value !== null && value !== ""
    ) // Filtrar valores nulos o vacíos
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");
};

export const getPaymentListByOrderId = async (id: string) => {
  try {
    const response = await api.get(`/pagos/list?pedidoId=${id}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getPaymentsById = async (payload) => {
  try {
    const response = await api.get(`/pagos/${payload}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const putPaymentById = async (payload) => {
  try {
    await api.put(`/pagos/${payload.id}`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const deletePaymentById = async (payload) => {
  try {
    await api.delete(`/pagos/${payload.id}`);
    return true;
  } catch (e) {
    throw e;
  }
};

export const postPayment = async (payload) => {
  try {
    await api.post(`/pagos`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const getTotalPaymentByRoadmap = async (payload) => {
  try {
    const response = await api.get(
      `/pagos/saldo-por-metodopago?hojaRutaId=${payload.hojaRutaId}&metodoPagoId=${payload.metodoPagoId}`
    );
    return response.data;
  } catch (e) {
    throw e;
  }
};
