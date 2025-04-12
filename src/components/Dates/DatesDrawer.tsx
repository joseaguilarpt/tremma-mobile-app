import { Animated, View } from "react-native";
import { Button, Drawer, useTheme } from "react-native-paper";
import { Calendar } from "react-native-calendars";

import React from "react";

type DatesDrawerProps = {
    closeDrawer: () => void;
    selectedRange: {
        startDate: string | null;
        endDate: string | null;
    };
    setSelectedRange: (range: { startDate: string | null; endDate: string | null }) => void;
};

export default function DatesDrawer({
    closeDrawer,
    selectedRange,
    setSelectedRange,
}: DatesDrawerProps) {
    const theme = useTheme();

    // Función para generar fechas intermedias entre la fecha de inicio y fin
    const generateIntermediateDates = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const dates = [];

        while (start < end) {
            start.setDate(start.getDate() + 1);
            dates.push(start.toISOString().split("T")[0]); // Agregar fecha en formato YYYY-MM-DD
        }

        return dates;
    };

    const markedDates: Record<string, any> = {};
    if (selectedRange.startDate) {
        markedDates[selectedRange.startDate] = {
            selected: true,
            startingDate: true,
            color: "rgba(255, 74, 2, 0.8)",
        };
    }
    if (selectedRange.endDate) {
        markedDates[selectedRange.endDate] = {
            selected: true,
            endingDay: true,
            color: "rgba(255, 74, 2, 0.8)",
        };
    }

    // Marcar las fechas intermedias con un color diferente
    if (selectedRange.startDate && selectedRange.endDate) {
        const intermediateDates = generateIntermediateDates(
            selectedRange.startDate,
            selectedRange.endDate
        );
        intermediateDates.forEach((date) => {
            markedDates[date] = {
                selected: true,
                color: "rgba(255, 74, 2, 0.8)",
            };
        });
    }

    const onDayPress = (day: { dateString: string }) => {
        const { startDate, endDate } = selectedRange;

        if (!startDate || (startDate && endDate)) {
            // Si no hay fecha de inicio o ya hay un rango, seleccionamos una nueva fecha de inicio
            setSelectedRange({ startDate: day.dateString, endDate: null });
        } else {
            closeDrawer();
            // Si ya hay una fecha de inicio, seleccionamos la fecha final
            setSelectedRange({
                startDate,
                endDate: day.dateString,
            });
        }
    };

    return (
        <Drawer.Section title="Seleccionar Fechas">
            <View style={{ padding: 20 }}>
                <Calendar
                    onDayPress={onDayPress}
                    markedDates={markedDates}
                    markingType={"period"}
                    theme={{
                        backgroundColor: theme.colors.background, // Fondo del calendario
                        calendarBackground: theme.colors.background, // Fondo del calendario
                        todayTextColor: "white", // Color de la fecha de hoy
                        textDayFontFamily: "sans-serif",
                        textMonthFontFamily: "sans-serif",
                        textDayHeaderFontFamily: "sans-serif",
                        dayTextColor: "white", // Color del texto de los días
                        arrowColor: "white", // Color de las flechas de navegación
                        monthTextColor: "white", // Color del mes
                    }}
                />
            </View>
            <Button
                mode="contained"
                onPress={() => {
                    setSelectedRange({
                        endDate: null,
                        startDate: null,
                    });
                }}
                style={{
                    margin: 20,
                    marginBottom: 10,
                    backgroundColor: "rgba(255, 74, 2, 0.8)",
                }}
            >
                Borrar Fechas
            </Button>

            <Button
                onPress={closeDrawer}
                mode="outlined"
                style={{ margin: 20, marginTop: 0 }}
            >
                Cerrar Calendario
            </Button>
        </Drawer.Section>
    );
}

