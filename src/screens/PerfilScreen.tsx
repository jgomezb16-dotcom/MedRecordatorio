import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { AuthService } from "../services/AuthService";
import { Boton } from "../components/Boton";
import { colores } from "../theme";

const authService = new AuthService();

export default function PerfilScreen() {
  const [email, setEmail] = useState<string>("");
  const [cerrando, setCerrando] = useState<boolean>(false);

  useEffect(() => {
    authService.obtenerSesion().then((session) => {
      setEmail(session?.user.email ?? "");
    });
  }, []);

  async function manejarCerrarSesion() {
    setCerrando(true);
    try {
      await authService.cerrarSesion();
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "No se pudo cerrar sesión.");
      setCerrando(false);
    }
  }

  return (
    <View style={styles.pantalla}>
      <View style={styles.tarjeta}>
        <Text style={styles.etiqueta}>Sesión iniciada como</Text>
        <Text style={styles.email}>{email}</Text>
      </View>

      <Text style={styles.aviso}>
        MedRecordatorio solo te recuerda lo que tú registras. No sustituye las indicaciones de tu médico.
      </Text>

      <Boton titulo="Cerrar sesión" variante="peligro" onPress={manejarCerrarSesion} cargando={cerrando} />
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo, padding: 16 },
  tarjeta: {
    backgroundColor: colores.tarjeta,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colores.borde,
  },
  etiqueta: { fontSize: 16, color: colores.textoSuave },
  email: { fontSize: 19, fontWeight: "600", color: colores.texto, marginTop: 4 },
  aviso: { fontSize: 15, color: colores.textoSuave, marginTop: 20, lineHeight: 21 },
});