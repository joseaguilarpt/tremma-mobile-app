import * as React from "react";
import { useLoading } from "./loading.utils";
import { useNotifications } from "./notification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Order, Roadmap } from "@/types/Roadmap";
import uuid from "react-native-uuid";
import { useAuth } from "./auth";
import { useExpoSQLiteOperations } from "@/hooks/useExpoSQLiteOperations";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getTotalPaymentByRoadmap } from "@/api/payments";

const RoadmapContext = React.createContext(null);

export const RoadmapProvider = ({ children }) => {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [roadmap, setRoadmap] = React.useState<Roadmap | any>(null);
  const [efectivo, setEfectivo] = React.useState(0);
  const [order, setOrder] = React.useState<Order | any>({});
  const [paymentMethods, setPaymentMethods] = React.useState([]);
  const [clientIdsList, setClientIdsList] = React.useState([]);
  const isOffline = useSelector((state: RootState) => state.offline.isOfflineMode);

  const pendingSync = useSelector((state: RootState) => state.offline.pending);
  const { getRoadmap, createReturns, recreateTables, getUsers, getOrders, startRoadmap, getPayments, getPaymentMethods, getOrderById, postClientsList, getClientById, getPaymentConditions } = useExpoSQLiteOperations()
  //  AsyncStorage.removeItem("loaded-orders")
  //   AsyncStorage.removeItem("active-roadmap")
  //   recreateTables()
  const [payments, setPayments] = React.useState([]);
  const [blockedOrders, setBlockedOrders] = React.useState([]);
  const { setLoading } = useLoading();
  const { showSnackbar } = useNotifications();
  const { user } = useAuth();

  const handleSavePayment = (values) => {
    setPayments((prev) => [...prev, { Id: uuid.v4(), ...values }]);
  };

  const getStorageOrders = async () => {
    try {
      let alreadyLoaded = {};
      const loadedOrders = await AsyncStorage.getItem("loaded-orders");
      if (loadedOrders) {
        const data: { [key: string]: number[] } = JSON.parse(loadedOrders);
        alreadyLoaded = data;
      }
      return alreadyLoaded;
    } catch (e) {
      return {};
    }
  };

  const handleOrderReturns = (order: Order) => {
    const returns = order.Devoluciones ?? [];
    let pending = [];
    if (returns.length > 0) {
      pending = returns.filter((item) => item.Estado !== "Cerrado");
    }
    return pending;
  };

  const fetchData = async () => {
    try {

      const response = await getRoadmap();
      const clientIds = new Set();
      setRoadmap(response);
      const alreadyLoaded = await getStorageOrders();
      const currentLoadedOrders = alreadyLoaded[response.Id];
      const ordersWithReturns = [];
      (response?.Pedidos ?? [])
        .filter((item) => !item.Bloqueado && item.Estado !== "No Cargado" && !item.Completado)
        .forEach((item) => {
          let newOrder = { ...item, key: item.Id };
          clientIds.add(item.CodigoCliente);
          if (currentLoadedOrders) {
            const orderIsLoaded = (currentLoadedOrders ?? []).find(
              (v) => String(v) === String(item.Id)
            );
            if (orderIsLoaded) {
              newOrder.Estado = "Cargado";
            } else if ((currentLoadedOrders ?? []).indexOf(item.Id) === -1) {
              newOrder.Estado = "Asignado";
            }
          } else {
            newOrder.Estado = "Asignado";
          }
          newOrder.Devoluciones = handleOrderReturns(item);
          ordersWithReturns.push(newOrder);
        });
      setBlockedOrders(
        (response?.Pedidos ?? []).filter((item) => item.Bloqueado)
      );

      setClientIdsList(new Array(...clientIds));
      const returns = ordersWithReturns.flatMap((item) => item.Devoluciones);
      if (returns.length > 0) {
        try {
          await createReturns(returns);
        } catch (error) {
          console.error("Error creating returns:", error);
        }
      }

      try {
        for (const order of ordersWithReturns) {
          await getPayments(order.Id);
        }
      } catch (error) {
        console.error("Error getting payments:", error);
      }
      setOrders(ordersWithReturns);
      return {
        orders: ordersWithReturns,
        roadmap: response,
        blockedOrders: (response?.Pedidos ?? []).filter(
          (item) => item.Bloqueado || item.bloqueado === 1
        ),
      };
    } catch (error) {
      return {
        orders: [],
        roadmap: {},
        blockedOrders: [],
      };
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      if (!isOffline) {
        const promises = clientIdsList.map(async (clientId) => {
          const client = await getClientById(clientId as string);
          return client;
        });
        const clients = [];
        for (const clientPromise of promises) {
          const client = await clientPromise;
          clients.push(client);
        }
        await postClientsList(clients);
      }
    } catch (error) {
      console.error("Error posting clients list:", error);
    }
  }

  const getCashPayments = async () => {
    try {
      const resp = await getTotalPaymentByRoadmap({
        hojaRutaId: roadmap?.Id,
        metodoPagoId: 1,
      });
      setEfectivo(resp);
    } catch (error) { }
  };

  const getListData = async () => {
    try {
      const methods = await getPaymentMethods();
      await getPaymentConditions();
      await getUsers({ Descripcion: "" })
      setPaymentMethods(methods);
    } catch (error) { }
  };

  const fetchPayments = async (id: string) => {
    try {
      const response = await getPayments(id);
      setPayments(response);
    } catch (error) { }
  };

  const fetchOrder = async (id: string) => {
    try {
      const currentOrder =
        (orders ?? []).find((item) => String(item.Id) === String(id)) ?? {};
      const response = await getOrderById(id);
      const client = await getClientById(response?.Cliente?.Codigo);
      const payload = {
        ...currentOrder,
        ...response,
        Cliente: client,
      }
      if (isOffline) {
        const paymentConditions = await getPaymentConditions();
        if (paymentConditions.length > 0) {
          payload.CondicionPago = paymentConditions.find((item) => item.Descripcion === response.CondicionPago.Descripcion);
        }
      }
      setOrder(payload);
      fetchPayments(id);
    } catch (error) {
      console.error("Error fetching order:", error);
      showSnackbar(
        "Error al carga el Pedido, por favor intente nuevamente",
        "error"
      );
    }
  };



  const storeActiveRoadmap = async () => {
    try {
      await AsyncStorage.setItem("active-roadmap", String(roadmap.Id));
    } catch (error) {
      console.error("Error loading active order:", error);
    }
  };

  const onStartRoadmap = async () => {
    const hasMissing = (orders ?? []).some((item) => item.Estado !== "Cargado");
    try {
      if (hasMissing) {
        showSnackbar(
          "Para continuar, asegúrate de que todos los pedidos estén marcados.",
          "error"
        );
        throw new Error("Para continuar, asegúrate de que todos los pedidos estén marcados.");
      }
      setLoading(true);
      await startRoadmap(roadmap.Id as string);
      await storeActiveRoadmap();
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (clientIdsList.length > 0) {
      fetchClients();
    }
  }, [clientIdsList]);

  React.useEffect(() => {
    if (user?.id && !roadmap && pendingSync === 0) {
      fetchData();
      getListData();
    }

    // Solo ejecutar el intervalo si no hay operaciones en curso
    const interval = setInterval(() => {
      if (user?.id && pendingSync === 0) {
        fetchData();
      }
    }, 30 * 1000); // Aumentar a 30 segundos para reducir frecuencia

    return () => clearInterval(interval);
  }, [user?.id, roadmap]); // Agregar roadmap como dependencia

  const data = React.useMemo(
    () => ({
      orders,
      setOrders,
      roadmap,
      setRoadmap,
      refresh: fetchData,
      order,
      efectivo,
      setOrder,
      fetchOrder,
      paymentMethods,
      payments,
      setPayments,
      blockedOrders,
      addPayment: handleSavePayment,
      getStorageOrders,
      getCashPayments,
      fetchPayments,
      onStartRoadmap,
    }),
    [
      roadmap,
      orders,
      order,
      paymentMethods,
      payments,
      blockedOrders,
      fetchOrder,
      fetchData,
      setOrder,
      onStartRoadmap,
      efectivo,
    ]
  );
  return (
    <RoadmapContext.Provider value={data}>{children}</RoadmapContext.Provider>
  );
};

export function useRoadmap() {
  const context = React.useContext(RoadmapContext);
  if (!context) throw new Error("Error getting the roadmap context");
  return context;
}
