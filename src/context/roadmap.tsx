import * as React from "react";
import { useLoading } from "./loading.utils";
import { getCurrentRoadmap, getOrderById } from "@/api/orders";
import { useNotifications } from "./notification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Order, Roadmap } from "@/types/Roadmap";
import { getClientById } from "@/api/clients";
import { getPaymentMethodList } from "@/api/paymentMethods";
import uuid from "react-native-uuid";
import { getPaymentListByOrderId } from "@/api/payments";
import { useAuth } from "./auth";

const RoadmapContext = React.createContext(null);

export const RoadmapProvider = ({ children }) => {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [roadmap, setRoadmap] = React.useState<Roadmap | any>(null);
  const [order, setOrder] = React.useState<Order | any>({});
  const [paymentMethods, setPaymentMethods] = React.useState([]);
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
      const response = await getCurrentRoadmap();
      setRoadmap(response);
      const alreadyLoaded = await getStorageOrders();
      const currentLoadedOrders = alreadyLoaded[response.Id];
      const ordersWithReturns = [];
      (response?.Pedidos ?? [])
        .filter((item) => !item.Bloqueado)
        .forEach((item) => {
          let newOrder = { ...item, key: item.Id };
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

      setOrders(ordersWithReturns);
      return {
        orders: ordersWithReturns,
        roadmap: response,
        blockedOrders: (response?.Pedidos ?? []).filter(
          (item) => item.Bloqueado
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

  const getListData = async () => {
    try {
      const methods = await getPaymentMethodList();
      setPaymentMethods(methods);
    } catch (error) {}
  };

  const fetchPayments = async (id: string) => {
    try {
      const response = await getPaymentListByOrderId(id);
      setPayments(response);
    } catch (error) {}
  };
  const fetchOrder = async (id: string) => {
    try {
      const currentOrder =
        (orders ?? []).find((item) => String(item.Id) === String(id)) ?? {};
      const response = await getOrderById(id);
      const client = await getClientById(response?.Cliente?.Codigo);
      setOrder({
        ...currentOrder,
        ...response,
        Cliente: client,
      });
      fetchPayments(id);
    } catch (error) {
      showSnackbar(
        "Error al carga el Pedido, por favor intente nuevamente",
        "error"
      );
    }
  };

  React.useEffect(() => {
    if (user?.id) {
      fetchData();
      getListData();
    }
    const interval = setInterval(() => {
      console.log("Fetching roadmap data...");
      if (user?.id) {
        fetchData();
      }
    }, 20 * 1000); // 20 seconds
    return () => clearInterval(interval);
  }, [user?.id]);

  const data = React.useMemo(
    () => ({
      orders,
      setOrders,
      roadmap,
      setRoadmap,
      refresh: fetchData,
      order,
      setOrder,
      fetchOrder,
      paymentMethods,
      payments,
      setPayments,
      blockedOrders,
      addPayment: handleSavePayment,
      getStorageOrders,
      fetchPayments,
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
