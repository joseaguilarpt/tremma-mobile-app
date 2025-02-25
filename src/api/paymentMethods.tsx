import api from "./api";
import { decodeMenuItems } from "./dashboard";

const encodeParams = (params: Record<string, any>): string => {
  return Object.entries(params)
    .filter(
      ([_, value]) => value !== undefined && value !== null && value !== "",
    ) // Filtrar valores nulos o vacíos
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("&");
};

export const getPaymentMethodList = async () => {
  try {
    const response = await api.get(`/metodopagos/list`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getPaymentMethodsList = async (payload) => {
  try {
    const response = await api.get(`/metodopagos?${encodeParams(payload)}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getAllPaymentMethods = async () => {
  try {
    const response = await api.get(`/metodopagos`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const enableOrDisablePaymentMethod = async (id) => {
  try {
    await api.delete(`/metodopagos/state/${id}`);
    return true;
  } catch (e) {
    throw e;
  }
};

export const getPaymentMethodById = async (payload) => {
  try {
    const response = await api.get(`/metodopagos/${payload}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const putPaymentMethodById = async (payload) => {
  try {
    await api.put(`/metodopagos/${payload.id}`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const postPaymentMethod = async (payload) => {
  try {
    await api.post(`/metodopagos`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};
