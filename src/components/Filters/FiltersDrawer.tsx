import { Animated, View } from "react-native";
import { Button, Drawer, TextInput, useTheme } from "react-native-paper";

import React from "react";

type FilterDrawerProps = {
  closeDrawer: () => void;
  filter: string;
  onApply: () => void;
  title?: string;
  setFilter: (v: string) => void;
};

export default function FilterDrawer({
  closeDrawer,
  filter,
  onApply = () => {},
  setFilter,
  title
}: FilterDrawerProps) {
  return (
    <Drawer.Section title={title ? title : "Buscar Mensaje"}>
      <View style={{ padding: 20 }}>
        <TextInput
          //label="Buscar Mensaje"
          value={filter}
          onChangeText={(text) => setFilter(text)}
        />
      </View>
      <Button
        mode="contained"
        onPress={onApply}
        style={{
          margin: 20,
          marginBottom: 10,
          backgroundColor: "rgba(255, 74, 2, 0.8)",
        }}
      >
        Aplicar Filtro
      </Button>
      {filter && (
        <Button
          mode="contained"
          onPress={() => {
            setFilter("");
          }}
          style={{
            margin: 20,
            marginTop: 0,
            marginBottom: 10,
          }}
        >
          Borrar Filtro
        </Button>
      )}

      <Button
        onPress={closeDrawer}
        mode="outlined"
        style={{ margin: 20, marginTop: 0 }}
      >
        Cancelar
      </Button>
    </Drawer.Section>
  );
}
