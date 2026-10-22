import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { Historial, TomaService } from "../services/TomaService";
import { colores } from "../theme";

const tomaService = new TomaService();

function formatearFecha(fecha: Date): string {
  return fecha.toLocaleString("es-GT", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function colorPorcentaje(porcentaje: number): string {
  if (porcentaje >= 80) return colores.exito;
  if (porcentaje >= 50) return "#B26A00";
  return colores.peligro;
}

export default function HistorialScreen() {
  const [historial, setHistorial] = useState<Historial>({ cumplimiento: [], tomas: [] });
  const [cargando, setCargando] = useState<boolean>(true);

  useFocusEffect(
    useCallback(() => {
      tomaService
        .obtenerHistorial()
        .then(setHistorial)
        .catch((e: unknown) => {
          Alert.alert("Error", e instanceof Error ? e.message : "No se pudo cargar el historial.");
        })
        .finally(() => setCargando(false));
    }, [])
  );

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.pantalla}
      contentContainerStyle={styles.lista}
      data={historial.tomas}
      keyExtractor={(t) => String(t.id)}
      ListHeaderComponent={
        <View>
          <Text style={styles.titulo}>Cumplimiento</Text>
          {historial.cumplimiento.length === 0 && (
            <Text style={styles.vacio}>Aún no hay tomas registradas.</Text>
          )}
          {historial.cumplimiento.map((c) => (
            <View key={c.medicamentoId} style={styles.tarjeta}>
              <View style={styles.fila}>
                <Text style={styles.nombre}>{c.nombre}</Text>
                <Text style={[styles.porcentaje, { color: colorPorcentaje(c.porcentaje) }]}>
                  {c.porcentaje}%
                </Text>
              </View>
              <View style={styles.barra}>
                <View
                  style={[
                    styles.relleno,
                    { width: `${c.porcentaje}%`, backgroundColor: colorPorcentaje(c.porcentaje) },
                  ]}
                />
              </View>
              <Text style={styles.detalle}>
                {c.tomadas} de {c.total} tomas
              </Text>
            </View>
          ))}
          {historial.tomas.length > 0 && <Text style={styles.titulo}>Registro</Text>}
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.registro}>
          <View style={{ flex: 1 }}>
            <Text style={styles.nombreRegistro}>{item.nombreMedicamento}</Text>
            <Text style={styles.detalle}>{formatearFecha(item.fechaHora)}</Text>
          </View>
          {item.estado === "tomado" && <Text style={[styles.estado, { color: colores.exito }]}>✓ Tomado</Text>}
          {item.estado === "omitido" && <Text style={[styles.estado, { color: colores.peligro }]}>✗ Omitido</Text>}
          {item.estado === "pendiente" && (
            <Text style={[styles.estado, { color: colores.textoSuave }]}>Sin registrar</Text>
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
  titulo: { fontSize: 20, fontWeight: "700", color: colores.primarioOscuro, marginBottom: 10, marginTop: 4 },
  vacio: { fontSize: 17, color: colores.textoSuave, marginBottom: 16 },
  tarjeta: {
    backgroundColor: colores.tarjeta,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 16,
    marginBottom: 12,
  },
  fila: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  nombre: { fontSize: 19, fontWeight: "700", color: colores.texto, flex: 1 },
  porcentaje: { fontSize: 24, fontWeight: "800" },
  barra: { height: 10, backgroundColor: colores.borde, borderRadius: 5, marginTop: 10, overflow: "hidden" },
  relleno: { height: "100%", borderRadius: 5 },
  detalle: { fontSize: 15, color: colores.textoSuave, marginTop: 4 },
  registro: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colores.tarjeta,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  nombreRegistro: { fontSize: 17, fontWeight: "600", color: colores.texto },
  estado: { fontSize: 15, fontWeight: "700" },
});