import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { EstadoToma, Toma } from "../models/Toma";
import { TomaService } from "../services/TomaService";
import { colores } from "../theme";

const tomaService = new TomaService();

function formatearHora(fecha: Date): string {
  return fecha.toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit" });
}

export default function HoyScreen() {
  const [tomas, setTomas] = useState<Toma[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [refrescando, setRefrescando] = useState<boolean>(false);

  async function cargar() {
    try {
      await tomaService.generarProximasTomas();
      setTomas(await tomaService.listarHoy());
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "No se pudieron cargar las tomas.");
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [])
  );

  async function marcar(toma: Toma, estado: EstadoToma) {
    try {
      await tomaService.marcar(toma.id, estado);
      setTomas((actuales) =>
        actuales.map((t) =>
          t.id === toma.id
            ? new Toma(t.id, t.medicamentoId, t.fechaHora, estado, t.nombreMedicamento, t.dosis, t.fotoUri)
            : t
        )
      );
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "No se pudo guardar.");
    }
  }

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  const tomadas = tomas.filter((t) => t.estado === "tomado").length;

  return (
    <FlatList
      style={styles.pantalla}
      contentContainerStyle={styles.lista}
      data={tomas}
      keyExtractor={(t) => String(t.id)}
      refreshControl={
        <RefreshControl
          refreshing={refrescando}
          onRefresh={() => {
            setRefrescando(true);
            cargar();
          }}
        />
      }
      ListHeaderComponent={
        tomas.length > 0 ? (
          <Text style={styles.resumen}>
            {tomadas} de {tomas.length} tomas completadas
          </Text>
        ) : undefined
      }
      ListEmptyComponent={<Text style={styles.vacio}>No tienes tomas programadas para hoy.</Text>}
      renderItem={({ item }) => (
        <View style={[styles.tarjeta, item.estaAtrasada() && styles.tarjetaAtrasada]}>
          <View style={styles.fila}>
            <Text style={styles.hora}>{formatearHora(item.fechaHora)}</Text>
            {item.estado === "tomado" && <Text style={[styles.etiqueta, styles.tomado]}>✓ Tomado</Text>}
            {item.estado === "omitido" && <Text style={[styles.etiqueta, styles.omitido]}>✗ Omitido</Text>}
            {item.estaAtrasada() && <Text style={[styles.etiqueta, styles.omitido]}>Atrasada</Text>}
          </View>
          <View style={styles.medicamento}>
            {item.fotoUri && <Image source={{ uri: item.fotoUri }} style={styles.foto} />}
            <View style={{ flex: 1 }}>
              <Text style={styles.nombre}>{item.nombreMedicamento}</Text>
              <Text style={styles.dosis}>{item.dosis}</Text>
            </View>
          </View>

          {item.estado === "pendiente" && (
            <View style={styles.botones}>
              <Pressable style={[styles.boton, styles.botonTomado]} onPress={() => marcar(item, "tomado")}>
                <Text style={styles.textoBoton}>Tomado</Text>
              </Pressable>
              <Pressable style={[styles.boton, styles.botonOmitido]} onPress={() => marcar(item, "omitido")}>
                <Text style={styles.textoBoton}>Omitido</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  centro: { flex: 1, justifyContent: "center", backgroundColor: colores.fondo },
  lista: { padding: 16 },
  resumen: { fontSize: 18, fontWeight: "600", color: colores.primarioOscuro, marginBottom: 12 },
  vacio: { fontSize: 17, color: colores.textoSuave, textAlign: "center", marginTop: 40 },
  tarjeta: {
    backgroundColor: colores.tarjeta,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 16,
    marginBottom: 12,
  },
  tarjetaAtrasada: { borderColor: colores.peligro, borderWidth: 2 },
  fila: { flexDirection: "row", alignItems: "center", gap: 8 },
  hora: { fontSize: 22, fontWeight: "700", color: colores.primario },
  etiqueta: { fontSize: 15, fontWeight: "700" },
  tomado: { color: colores.exito },
  omitido: { color: colores.peligro },
  medicamento: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 4 },
  foto: { width: 56, height: 56, borderRadius: 8 },
  nombre: { fontSize: 20, fontWeight: "700", color: colores.texto, marginTop: 4 },
  dosis: { fontSize: 17, color: colores.textoSuave },
  botones: { flexDirection: "row", gap: 10, marginTop: 12 },
  boton: { flex: 1, minHeight: 48, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  botonTomado: { backgroundColor: colores.exito },
  botonOmitido: { backgroundColor: colores.peligro },
  textoBoton: { color: "#FFFFFF", fontSize: 18, fontWeight: "600" },
});