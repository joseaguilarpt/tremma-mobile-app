import api from "./api";

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

export const getRoadmapsList = async (payload) => {
  try {
    const response = await api.get(`/hojarutas?${encodeParams(payload)}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getAllRoadmaps = async () => {
  try {
    const response = await api.get(`/hojarutas/list`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getRoadmapById = async (payload) => {
  try {
    const response = await api.get(`/hojarutas/${payload}`);
    return {
      ...response.data,
    };
  } catch (e) {
    throw e;
  }
};

export const putRoadmapById = async (payload) => {
  try {
    await api.put(`/hojarutas/${payload.id}`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const postRoadmap = async (payload) => {
  try {
    await api.post(`/hojarutas`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const postManualRoadmap = async (payload) => {
  try {
    const response = await api.post(`/hojarutas/manual`, payload);
    return response.data;
  } catch (e) {
    throw e;
  }
};

export const deleteRoadmapById = async (id: string) => {
  try {
    await api.delete(`/hojarutas/state/${id}`);
    return true;
  } catch (e) {
    throw e;
  }
};

export const getDistrictRoadmap = async (id: string) => {
  try {
    const response = await api.get(`/hojarutas/${id}/distrito`);
    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getRoadmapStatuses = async () => {
  try {
    const response = await api.get(`/estados/list`);
    return response.data;
  } catch (e) {
    throw e;
  }
};


export const getPaymentConditions = async () => {
  try {
    const response = await api.get(`/condicionpagos/list`);
    return response.data;
  } catch (e) {
    throw e;
  }
};
