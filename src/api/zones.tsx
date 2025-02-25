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

export const getZoneList = async (payload) => {
  try {
    const response = await api.get(`/zonas?${encodeParams(payload)}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getAllZones = async () => {
  try {
    const response = await api.get(`/zonas/list`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getZoneById = async (payload) => {
  try {
    const response = await api.get(`/zonas/${payload}`);
    const zones = await api.get(`/zonas/distritosxzona?zonaId=${payload}`);
    return {
      ...response.data,
      districts: zones.data,
    };
  } catch (e) {
    throw e;
  }
};

export const putZoneById = async (payload) => {
  try {
    await api.put(`/zonas/${payload.id}`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const postZone = async (payload) => {
  try {
    await api.post(`/zonas`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const deleteZoneById = async (id: string) => {
  try {
    await api.delete(`/zonas/state/${id}`);
    return true;
  } catch (e) {
    throw e;
  }
};

export const getDistrictZone = async (id: string) => {
  try {
    const response = await api.get(`/zonas/${id}/distrito`);
    return response.data;
  } catch (e) {
    throw e;
  }
};
