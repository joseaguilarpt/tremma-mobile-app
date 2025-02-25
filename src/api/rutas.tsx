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

export const getRouteList = async (payload) => {
  try {
    const response = await api.get(`/rutas?${encodeParams(payload)}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getAllRoutes = async () => {
  try {
    const response = await api.get(`/rutas/list`);

    return response.data;
  } catch (e) {
    throw e;
  }
};

export const getRouteById = async (payload) => {
  try {
    const response = await api.get(`/rutas/${payload}`);
    return {
      ...response.data,
    };
  } catch (e) {
    throw e;
  }
};

export const putRouteById = async (payload) => {
  try {
    await api.put(`/rutas/${payload.id}`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const postRoute = async (payload) => {
  try {
    await api.post(`/rutas`, payload);
    return true;
  } catch (e) {
    throw e;
  }
};

export const deleteRouteById = async (id: string) => {
  try {
    await api.delete(`/rutas/state/${id}`);
    return true;
  } catch (e) {
    throw e;
  }
};

export const getDistrictRoute = async (id: string) => {
  try {
    const response = await api.get(`/rutas/${id}/distrito`);
    return response.data;
  } catch (e) {
    throw e;
  }
};
