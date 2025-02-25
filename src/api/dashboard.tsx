import api from "./api";

export const decodeMenuItems = (options) => {
  const groupedOptions = options
    ?.sort((a, b) => a.Orden - b.Orden) // Sort by 'Orden' (position)
    .map((item) => ({
      ...item,
      id: item.Id,
      module: item.Modulo,
      title: item.Nombre,
      position: item.Orden,
      link: item.Ruta,
      icon: item.Icono,
      parent: item.Padre ?? null,
      isDeleted: item.IsDeleted ?? false,
    }));
  return groupedOptions;
};

export const getMenuByUser = async () => {
  try {
    const response = await api.get("/menus/menu");

    return decodeMenuItems(response.data);
  } catch (e) {
    throw e;
  }
};

export const getSubMenuByModule = async (module, id) => {
  try {
    const response = await api.get(
      `/menus/opciones?modulo=${module}&optionId=${id}`,
    );
    return decodeMenuItems(response.data);
  } catch (e) {
    throw e;
  }
};
