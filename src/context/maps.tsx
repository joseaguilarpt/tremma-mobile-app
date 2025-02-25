import { ReactNode } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { GoogleMapsContext } from "./maps.utils";

const VV = "AIzaSyAfRinD8hK00IEQ0I6gs3bhtsUfPdFlcAE";

const libraries = ["places"]; // Load the Places library

export const GoogleMapsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: VV, libraries });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};
