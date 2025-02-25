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

export const getVehiclesList = async (payload) => {
  try {
    const response = await api.get(`/vehiculos?${encodeParams(payload)}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getAllVehicles = async () => {
  try {
    const response = await api.get(`/vehiculos`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const enableOrDisableVehicle = async (id) => {
  try {
    await api.delete(`/vehiculos/state/${id}`);
    return true;
  } catch (e) {
    throw e;
  }
};

export const getVehicleById = async (payload) => {
  try {
    const response = await api.get(`/vehiculos/${payload}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const putVehicleById = async (payload) => {
  try {
    await api.put(`/vehiculos/${payload.placa}`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const postVehicle = async (payload) => {
  try {
    await api.post(`/vehiculos`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};
