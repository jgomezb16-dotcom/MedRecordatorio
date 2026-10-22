import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AuthService } from "../services/AuthService";
import { AuthStackParamList } from "../navigation/tipos";
import { CampoTexto } from "../components/CampoTexto";
import { Boton } from "../components/Boton";
import { colores } from "../theme";

type Props = NativeStackScreenProps<AuthStackParamList, "Registro">;

const authService = new AuthService();

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmacion, setConfirmacion] = useState<string>("");
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function manejarRegistro() {
    setError(null);

    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);
    try {
      const session = await authService.registrar(email, password);

      if (!session) {
        Alert.alert("Revisa tu correo", "Te enviamos un enlace para confirmar tu cuenta.");
        navigation.goBack();
      }
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
        <Text style={styles.titulo}>Crear cuenta</Text>
        <Text style={styles.subtitulo}>Tus medicamentos, siempre a tiempo</Text>

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
          placeholder="Mínimo 6 caracteres"
          secureTextEntry
        />
        <CampoTexto
          etiqueta="Confirmar contraseña"
          value={confirmacion}
          onChangeText={setConfirmacion}
          placeholder="Repite la contraseña"
          secureTextEntry
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Boton titulo="Registrarme" onPress={manejarRegistro} cargando={cargando} />

        <Pressable onPress={() => navigation.goBack()} style={styles.enlace}>
          <Text style={styles.textoEnlace}>Ya tengo cuenta</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { flex: 1, justifyContent: "center", padding: 24 },
  titulo: { fontSize: 28, fontWeight: "700", color: colores.primarioOscuro, textAlign: "center" },
  subtitulo: { fontSize: 17, color: colores.textoSuave, textAlign: "center", marginBottom: 28 },
  error: { color: colores.peligro, fontSize: 16, marginTop: 4 },
  enlace: { marginTop: 20, alignItems: "center", padding: 8 },
  textoEnlace: { color: colores.primario, fontSize: 17, fontWeight: "600" },
});