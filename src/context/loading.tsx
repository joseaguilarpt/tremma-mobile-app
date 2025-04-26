import React, { createContext, useState, useContext, ReactNode } from "react";
import { LoadingContext } from "./loading.utils";
import { ProgressBar } from "react-native-paper";
import { View } from "react-native";

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isLoading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading }}>
        {isLoading && <ProgressBar indeterminate={true} style={{ height: 10 }} />}

      {children}
    </LoadingContext.Provider>
  );
};
