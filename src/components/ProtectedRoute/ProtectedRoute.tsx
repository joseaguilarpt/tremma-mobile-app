import { useAuth } from "@/context/auth";
import { useFocusEffect, useNavigationState } from "@react-navigation/native";
import React from "react";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn } = useAuth();

  useFocusEffect(() => {
    isLoggedIn();
  });
  return children;
}
