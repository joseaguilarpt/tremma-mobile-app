import { ReactNode } from "react";
import { AuthProvider } from "./auth";
import { LoadingProvider } from "./loading";
import { SnackbarProvider } from "./notification";

function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LoadingProvider>
        <SnackbarProvider>{children}</SnackbarProvider>
      </LoadingProvider>
    </AuthProvider>
  );
}

export default AppProviders;
