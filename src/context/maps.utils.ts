import { createContext, useContext } from "react";

export interface GoogleMapsContextProps {
  isLoaded: boolean;
}

export const GoogleMapsContext = createContext<
  GoogleMapsContextProps | undefined
>(undefined);

// Hook para acceder al contexto
export function useGoogleMaps() {
  const context = useContext(GoogleMapsContext);
  if (!context)
    throw new Error("useGoogleMaps debe usarse dentro de GoogleMapsProvider");
  return context;
}
