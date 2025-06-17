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

export const getReturnsList = async (payload) => {
  try {
    const response = await api.get(`/devoluciones?${encodeParams(payload)}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};


export const closeOrderReturn = async (payload) => {
  try {
    const response = await api.put(`/devoluciones/cerrar?${encodeParams(payload)}`);

    return response.data;
  } catch (e) {
    throw e;
  }
};



