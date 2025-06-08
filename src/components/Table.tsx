import * as React from 'react';
import { ScrollView, View, StyleSheet, Dimensions } from 'react-native';
import { DataTable, Text } from 'react-native-paper';

type Column = {
  key: string;
  title: string;
  numeric?: boolean;
  widthPercent?: number; // porcentaje opcional para ancho relativo
};

type Props<T> = {
  columns: Column[];
  data: T[];
  keyExtractor: (item: T) => string;
  onSelect: (item: T) => void;
};

export function ReusableTable<T>({ columns, data, keyExtractor, onSelect }: Props<T>) {
  // Ancho total pantalla para calcular anchos proporcionales
  const screenWidth = Dimensions.get('window').width;

  return (
        <DataTable >
          {/* Header */}
          <DataTable.Header>
            {columns.map((col) => (
              <DataTable.Title
                key={col.key}
                style={[

                ]}
              >
                {col.title}
              </DataTable.Title>
            ))}
          </DataTable.Header>

          {/* Rows */}
          {data.length > 0 && data.map((item) => (
            <DataTable.Row key={keyExtractor(item)} onPress={() => onSelect(item)}>
              {columns.map((col) => {
                const value = (item as any)[col.key];
                return (
                  <DataTable.Cell
                    key={col.key}
                    style={[
                      
                    ]}
                  >
                    {String(value)}
                  </DataTable.Cell>
                );
              })}
            </DataTable.Row>
          ))}{data.length === 0 && (
            <View style={{ margin: "auto", padding: 15 }}>
                <Text>No hay información disponible.</Text>
            </View>
          )}
        </DataTable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cell: {
    // Para alinear texto y dar buen padding
    paddingHorizontal: 8,
  },
});
