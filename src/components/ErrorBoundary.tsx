import React, { Component, ErrorInfo } from "react";
import { View, StyleSheet } from "react-native";
import { Snackbar, Button, Text } from "react-native-paper";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null; // To hold error message for Snackbar
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  // Lifecycle method to catch errors in child components
  static getDerivedStateFromError(error: Error) {
    // Update state to indicate an error has occurred
    return { hasError: true, errorMessage: error.message };
  }

  // This method is called when an error is thrown
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by Error Boundary:", error, errorInfo);
  }

  // Function to close the Snackbar
  handleClose = () => {
    this.setState({ hasError: false, errorMessage: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Snackbar
            visible={this.state.hasError}
            onDismiss={this.handleClose}
            duration={6000}
            style={styles.snackbar}
          >
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Something went wrong: {this.state.errorMessage}
              </Text>
              <Button
                mode="text"
                onPress={this.handleClose}
                textColor="#ffffff"
                style={styles.closeButton}
              >
                Close
              </Button>
            </View>
          </Snackbar>
        </View>
      );
    }

    // Render children if no error occurred
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  snackbar: {
    backgroundColor: "#f44336", // Red background for the Snackbar
    borderRadius: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: {
    color: "#ffffff", // White text color
    flexShrink: 1,
  },
  closeButton: {
    marginLeft: 16,
  },
});

export default ErrorBoundary;
