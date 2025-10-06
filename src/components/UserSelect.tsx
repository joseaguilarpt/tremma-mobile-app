import React, { useEffect, useRef, useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import {
  TextInput,
  HelperText,
  ActivityIndicator,
  Text,
  Portal,
  Modal,
  Button,
  useTheme,
  Divider,
} from "react-native-paper";
import { useDebounce } from "../utils"; // Usa tu debounce
import { useExpoSQLiteOperations } from "@/hooks/useExpoSQLiteOperations";

const UserSelect = ({ onChange, name, disabled, error, helperText, label }) => {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoadingUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedFilterValue = useDebounce(inputValue, 500);
  const { getUsers } = useExpoSQLiteOperations();
  const isSelection = useRef(false);
  const theme = useTheme();
  const searchUsers = async () => {
    try {
      setLoadingUsers(true);
      const { Items = [] } = await getUsers({ Descripcion: inputValue });
      setUsers(Items);
      setShowDropdown(true);
    } catch {
      // Handle errors
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (!isSelection.current && debouncedFilterValue) {
      searchUsers();
    } else {
      isSelection.current = false;
    }
  }, [debouncedFilterValue]);

  const handleSelect = (user) => {
    setInputValue(user?.NombreCompleto);
    setShowDropdown(false);
    isSelection.current = true;
    onChange?.(name, user);
  };

  return (
    <View>
      <TextInput
        label={label ?? "Seleccionar usuario"}
        placeholder="Introduce un nombre..."
        mode="outlined"
        value={inputValue}
        onChangeText={setInputValue}
        disabled={disabled}
        error={error}
        right={
          loading ? (
            <TextInput.Icon icon={() => <ActivityIndicator size="small" />} />
          ) : null
        }
      />
      {!!helperText && (
        <HelperText type="error" visible={error}>
          {helperText}
        </HelperText>
      )}

      <Portal>
        <Modal
          visible={showDropdown}
          onDismiss={() => setShowDropdown(false)}
          contentContainerStyle={[styles.sheetContainer]}
        >
          <KeyboardAvoidingView behavior={undefined}>
            <FlatList
              data={users}
              keyExtractor={(item) => item.Id?.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => handleSelect(item)}>
                  <View style={styles.userItem}>
                    <Text>{item.NombreCompleto}</Text>
                  </View>
                  <Divider
                    style={{
                      margin: 16,
                    }}
                  />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                !loading && inputValue ? (
                  <Text style={{ textAlign: "center", marginTop: 20 }}>
                    Sin resultados
                  </Text>
                ) : null
              }
            />
          </KeyboardAvoidingView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  sheetContainer: {
    backgroundColor: "rgba(46, 64, 82, 0.8)",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  text: {
    marginBottom: 16,
    fontSize: 16,
  },
});

export default UserSelect;
