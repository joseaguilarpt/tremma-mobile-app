jest.mock("@/api/settings", () => ({
    getSettings: jest.fn(),
  }));
  
  jest.mock("@react-navigation/native", () => ({
    ...jest.requireActual("@react-navigation/native"),
    useNavigation: jest.fn(),
    useFocusEffect: jest.fn((cb) => cb()),
  }));
  
  jest.mock("expo-splash-screen", () => ({
    preventAutoHideAsync: jest.fn(),
    hideAsync: jest.fn(),
  }));
  
  jest.mock("expo-font", () => {
    const module = {
      ...jest.requireActual("expo-font"),
      isLoaded: jest.fn(() => true),
      useFonts: jest.fn(() => [true]),
      loadAsync: jest.fn(() => Promise.resolve()),
    };
    return module;
  });
  
  jest.mock("@/api/settings", () => ({
      getSettings: jest.fn()
    }));
  
  jest.mock("@/utils/notifications", () => ({
    useNotificationSetup: jest.fn(),
  }));
  
  jest.mock("@/context/auth", () => ({
    useAuth: () => ({
      user: {
        name: "test",
        lastname: "user",
        email: "test@test.com",
        id: 19,
        username: "testuser",
        role: [
          {
            Id: 1,
            Nombre: "Admin",
            Descripcion: "Rol Admin",
          },
        ],
        original: {
          Email: "test@test.co",
          Photo: "33a6fd78-66da-4bd9-bb13-8a8c54f1324b.png",
          Conductor: true,
          Datos: {
            Telefono: 123345,
            FechaCrtccss: "2025-11-28T18:00:00",
            DocCrtccss: "3ccaf272-1f5a-48b2-b1e3-6d906ed21f72.pdf",
            FechaPoliza: "2026-11-17T18:00:00",
            DocPoliza: "3eeb47c3-a67d-45fc-89cc-9fb0cc7903a0.pdf",
            DocLicencia: "7d769a6f-a75b-498c-aa2c-cb51f75c86c8.pdf",
            Licencia: "123453",
            FechaLicencia: "2025-11-28T18:00:00",
            Direccion: "Calle 1",
          },
          Roles: [
            {
              Id: 1,
              Nombre: "Admin",
              Descripcion: "Rol Admin",
            },
          ],
          TipoIdentificacion: {
            Mascara: "909990999",
            Orden: 1,
            Id: 1,
            Descripcion: "CÉDULA NACIONAL",
          },
          NombreCompleto: "test@test.co",
          Id: 19,
          Nombre: "test@test.co",
          Apellido1: "test@test.co",
          Apellido2: "test@test.co",
          Login: "99975393",
        },
      },
      loaded: true,
      imageSrc: "",
      isLoggedIn: jest.fn(() => Promise.resolve(true)),
      changePassword: jest.fn(),
      logout: jest.fn(),
      login: jest.fn(),
      isRoleAuthorized: jest.fn(() => true),
      roleOptions: [],
    }),
  }));
  
  jest.mock("@react-native-async-storage/async-storage", () => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
    getAllKeys: jest.fn(),
    multiGet: jest.fn(),
    multiSet: jest.fn(),
    multiRemove: jest.fn(),
  }));
  
  jest.mock("@/context/providers", () => ({
    __esModule: true,
    default: ({ children }) => children,
  }));
  
  jest.mock("react-native-gesture-handler", () => ({
    GestureHandlerRootView: jest
      .fn()
      .mockImplementation(({ children }) => children),
  }));
  
  jest.mock("react-native-reanimated", () => ({
    ...jest.requireActual("react-native-reanimated/mock"),
  }));
  
  jest.mock("@react-native-community/netinfo", () => ({
    addEventListener: jest.fn((callback) => {
      callback({ isConnected: true, isInternetReachable: true });
      return () => {};
    }),
  }));
  
  jest.mock("react-native-safe-area-context", () => ({
    ...jest.requireActual("react-native-safe-area-context"),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    SafeAreaProvider: ({ children }) => children,
  }));
  