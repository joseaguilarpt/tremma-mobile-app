import React, { createContext, useState, useContext, ReactNode } from "react";
import ReportViewerModal from "../ui/ReportViewer/ReportViewer";
import { ReportContext } from "./report.utils";

const initialReportState = {
  isOpen: false,
  title: "",
  params: {},
  name: "",
  serviceUrl: "",
};

// Provider component
export const ReportProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [reportModal, setReportModal] = useState(initialReportState);

  const closeReportModal = () => {
    setReportModal(initialReportState);
  };

  return (
    <ReportContext.Provider
      value={{ reportModal, setReportModal, closeReportModal }}
    >
      {children}
      <ReportViewerModal
        open={reportModal?.isOpen}
        onClose={() => setReportModal(initialReportState)}
        title={reportModal?.title}
        reportServiceUrl={reportModal?.serviceUrl}
        reportName={reportModal?.name}
        reportParameters={reportModal?.params}
      />
    </ReportContext.Provider>
  );
};
