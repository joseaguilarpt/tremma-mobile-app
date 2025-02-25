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

export const getRolesList = async (payload) => {
  try {
    const response = await api.get(`/roles?${encodeParams(payload)}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getAllRolesList = async () => {
  try {
    const response = await api.get(`/roles/list`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const enableOrDisableRole = async (id) => {
  try {
    await api.delete(`/roles/state/${id}`);
    return true;
  } catch (e) {
    throw e;
  }
};

export const getRoleMenuById = async (payload) => {
  try {
    const response = await api.get(`/rolesoptions/${payload}/menu`);

    return decodeMenuItems(response.data);
  } catch (e) {
    throw e;
  }
};

export const getRoleMenuItemsById = async (id, param) => {
  try {
    const response = await api.get(`/rolesoptions/${id}/menu?modulo=${param}`);

    return decodeMenuItems(response.data);
  } catch (e) {
    throw e;
  }
};

export const getRoleOptionsById = async (
  id: string,
  param?: any,
  subId?: string,
) => {
  try {
    // Build the query string conditionally
    const queryParams = new URLSearchParams();
    if (param) queryParams.append("modulo", param);
    if (subId) queryParams.append("optionId", subId);

    const response = await api.get(
      `/rolesoptions/${id}/options${queryParams.toString() ? `?${queryParams.toString()}` : ""}`,
    );

    return decodeMenuItems(response.data);
  } catch (e) {
    throw e;
  }
};
export const enableOrDisableRoleOptionsById = async (id, optionId) => {
  try {
    await api.delete(`/rolesoptions/${id}/${optionId}/state`);
    return true;
  } catch (e) {
    throw e;
  }
};

export const getRoleById = async (payload) => {
  try {
    const response = await api.get(`/roles/${payload}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const putRoleById = async (payload) => {
  try {
    await api.put(`/roles/${payload.id}`, {
      id: payload.id,
      nombre: payload.code,
      descripcion: payload.description,
      isDeleted: payload.isDeleted,
    });
    return true;
  } catch (e) {
    throw e;
  }
};

export const postRole = async (payload) => {
  try {
    await api.post(`/roles`, {
      id: payload.id,
      nombre: payload.code,
      descripcion: payload.description,
      isDeleted: payload.isDeleted,
    });
    return true;
  } catch (e) {
    throw e;
  }
};
