///rpt/pdf/reportname=rptMireporte

import { TREMMA_REPORT_URL } from "@/config";
import api from "./api";


export const getReportPDF = async (reportname, payload) => {
  try {
    const response = await api.post(`/pdf?reportname=${reportname}`, payload, {
      baseURL: TREMMA_REPORT_URL,
      headers: { "Content-Type": "application/json" },
      responseType: "arraybuffer"
    });
    return response.data;
  } catch (e) {
    console.log(JSON.stringify(e, null, 2))
    throw e;
  }
};