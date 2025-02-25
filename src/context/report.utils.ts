import { createContext, useContext } from "react";

type ReportModal = {
  isOpen: boolean;
  title: string;
  params: any;
  name: string;
  serviceUrl: string;
};

// Define the context types
export interface ReportContextType {
  reportModal: ReportModal;
  setReportModal: (reportModal: ReportModal) => void;
  closeReportModal: () => void;
}

// Create the ReportContext with default values
export const ReportContext = createContext<ReportContextType | undefined>(
  undefined,
);

// Custom hook to access loading state
export function useReport(): ReportContextType {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error("useReport must be used within a ReportProvider");
  }
  return context;
}
