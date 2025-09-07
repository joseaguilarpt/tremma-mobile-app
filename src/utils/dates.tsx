import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extender Day.js con los plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Obtener la zona horaria del sistema
const systemTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const dayCR = (date?: string) => {
  try {
    if (date) {
      return dayjs.tz(date, systemTimeZone);
    }
    return dayjs.tz(new Date(), systemTimeZone);
  } catch (error) {
    return dayjs.tz(new Date(), systemTimeZone);
  }
};

export default dayjs;
