import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { Session } from "@supabase/supabase-js";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { AuthService } from "../services/AuthService";
import { AppStackParamList, AuthStackParamList, TabsParamList } from "./tipos";
import { colores } from "../theme";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HoyScreen from "../screens/HoyScreen";
import MedicamentosScreen from "../screens/MedicamentosScreen";
import HistorialScreen from "../screens/HistorialScreen";
import PerfilScreen from "../screens/PerfilScreen";
import NuevoMedicamentoScreen from "../screens/NuevoMedicamentoScreen";

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tabs = createBottomTabNavigator<TabsParamList>();
const authService = new AuthService();

function icono(emoji: string) {
  return ({ focused }: { focused: boolean }) => (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
  );
}

function Pestanas() {
  return (
    <Tabs.Navigator screenOptions={{ tabBarActiveTintColor: colores.primario }}>
      <Tabs.Screen name="Hoy" component={HoyScreen} options={{ tabBarIcon: icono("📅") }} />
      <Tabs.Screen name="Medicamentos" component={MedicamentosScreen} options={{ tabBarIcon: icono("💊") }} />
      <Tabs.Screen name="Historial" component={HistorialScreen} options={{ tabBarIcon: icono("📊") }} />
      <Tabs.Screen name="Perfil" component={PerfilScreen} options={{ tabBarIcon: icono("👤") }} />
    </Tabs.Navigator>
  );
}

export default function AppNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
    authService.obtenerSesion().then((s) => {
      setSession(s);
      setCargando(false);
    });
    return authService.escucharCambios(setSession);
  }, []);

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  if (!session) {
    return (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} />
        <AuthStack.Screen name="Registro" component={RegisterScreen} />
      </AuthStack.Navigator>
    );
  }

  return (
    <AppStack.Navigator>
      <AppStack.Screen name="Principal" component={Pestanas} options={{ headerShown: false }} />
      <AppStack.Screen
        name="NuevoMedicamento"
        component={NuevoMedicamentoScreen}
        options={{ title: "Nuevo medicamento" }}
      />
    </AppStack.Navigator>
  );
}