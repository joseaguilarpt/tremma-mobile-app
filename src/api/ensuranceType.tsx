import api from "./api";

export const getEnsuranceTypesList = async () => {
  try {
    const response = await api.get(`/tipopolizas/list`);

    return response.data;
  } catch (e) {
    throw e;
  }
};
