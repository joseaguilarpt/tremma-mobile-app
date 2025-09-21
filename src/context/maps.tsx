import { ReactNode } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { GoogleMapsContext } from "./maps.utils";
import { MAPS_ALSA } from "@/config";


const libraries = ["places"]; // Load the Places library

export const GoogleMapsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: MAPS_ALSA, libraries });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};
