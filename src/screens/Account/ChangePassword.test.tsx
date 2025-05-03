import React from "react";
import ChangePassword from "./ChangePassword";
import { getSettings } from "@/api/settings";
import { render, waitFor } from "@testing-library/react-native";
import "react-native-gesture-handler/jestSetup";

describe("ChangePassword Screen", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    (getSettings as jest.Mock).mockResolvedValue([
      { Codigo: "caracteres_clave", Valor1: "8", Id: 1 },
      { Codigo: "mayusculas_clave", Valor1: "true", Valor2: "1", Id: 2 },
    ]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", async () => {
    const { findByText } = render(<ChangePassword />);

    await waitFor(() => {
      expect(findByText("Actualice su contraseña:")).toBeTruthy();
    });
  });
});
