import { useFocusEffect } from "@react-navigation/native";
import * as React from "react";

const OrdersContext = React.createContext(null);

export const OrdersProvider = ({ children, initialOrders = [] }) => {
  const [orders, setOrders] = React.useState([]);

  const initialize = React.useCallback(() => {
    if (initialOrders.length > 0) {
      setOrders(initialOrders);
    }
  }, [initialOrders]);
  useFocusEffect(() => {
    initialize();
  });
  return (
    <OrdersContext.Provider value={{ orders, setOrders }}>
      {children}
    </OrdersContext.Provider>
  );
};

export function useOrders() {
  const context = React.useContext(OrdersContext);
  if (!context) throw new Error("Error getting the orders context");
  return context;
}
