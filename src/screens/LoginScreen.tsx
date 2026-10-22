import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AuthService } from "../services/AuthService";
import { AuthStackParamList } from "../navigation/tipos";
import { CampoTexto } from "../components/CampoTexto";
import { Boton } from "../components/Boton";
import { colores } from "../theme";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

const authService = new AuthService();

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function manejarLogin() {
    setError(null);
    setCargando(true);
    try {
      await authService.iniciarSesion(email, password);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ocurrió un error inesperado.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <KeyboardAvoidingView
        style={styles.contenido}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.logo}>💊</Text>
        <Text style={styles.titulo}>MedRecordatorio</Text>
        <Text style={styles.subtitulo}>Nunca olvides una dosis</Text>

        <CampoTexto
          etiqueta="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          placeholder="ejemplo@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <CampoTexto
          etiqueta="Contraseña"
          value={password}
          onChangeText={setPassword}
          placeholder="Tu contraseña"
          secureTextEntry
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Boton titulo="Iniciar sesión" onPress={manejarLogin} cargando={cargando} />

        <Pressable onPress={() => navigation.navigate("Registro")} style={styles.enlace}>
          <Text style={styles.textoEnlace}>¿No tienes cuenta? Regístrate</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { flex: 1, justifyContent: "center", padding: 24 },
  logo: { fontSize: 56, textAlign: "center" },
  titulo: { fontSize: 30, fontWeight: "700", color: colores.primarioOscuro, textAlign: "center" },
  subtitulo: { fontSize: 17, color: colores.textoSuave, textAlign: "center", marginBottom: 32 },
  error: { color: colores.peligro, fontSize: 16, marginTop: 4 },
  enlace: { marginTop: 20, alignItems: "center", padding: 8 },
  textoEnlace: { color: colores.primario, fontSize: 17, fontWeight: "600" },
});