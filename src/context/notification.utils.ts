import { createContext, useContext } from "react";

export type NotificationContextType = {
  messages: any[];
  getMessages: () => Promise<void>;
  showSnackbar: (message: string, severity?: any) => void;
  showAlertModal: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
  ) => void;
};

export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);
