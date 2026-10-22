import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { AppStackParamList } from "../navigation/tipos";
import { MedicamentoConHorario, MedicamentoService } from "../services/MedicamentoService";
import { Boton } from "../components/Boton";
import { colores } from "../theme";

const medicamentoService = new MedicamentoService();

export default function MedicamentosScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [lista, setLista] = useState<MedicamentoConHorario[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);

  async function cargar() {
    try {
      setLista(await medicamentoService.listar());
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "No se pudieron cargar los medicamentos.");
    } finally {
      setCargando(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      cargar();
    }, [])
  );

  function confirmarEliminar(item: MedicamentoConHorario) {
    Alert.alert("Eliminar", `¿Eliminar ${item.medicamento.nombre} y todas sus tomas?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await medicamentoService.eliminar(item.medicamento.id);
            await cargar();
          } catch (e: unknown) {
            Alert.alert("Error", e instanceof Error ? e.message : "No se pudo eliminar.");
          }
        },
      },
    ]);
  }

  if (cargando) {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={colores.primario} />
      </View>
    );
  }

  return (
    <View style={styles.pantalla}>
      <FlatList
        data={lista}
        keyExtractor={(item) => String(item.medicamento.id)}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={<Text style={styles.vacio}>Aún no tienes medicamentos registrados.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.tarjeta} onLongPress={() => confirmarEliminar(item)}>
            {item.medicamento.fotoUri ? (
              <Image source={{ uri: item.medicamento.fotoUri }} style={styles.foto} />
            ) : (
              <View style={[styles.foto, styles.sinFoto]}>
                <Text style={styles.icono}>💊</Text>
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.nombre}>{item.medicamento.nombre}</Text>
              <Text style={styles.dosis}>{item.medicamento.dosis}</Text>
              {item.horario && <Text style={styles.horario}>{item.horario.describir()}</Text>}
              {item.medicamento.notas && <Text style={styles.notas}>{item.medicamento.notas}</Text>}
            </View>
          </Pressable>
        )}
      />
      <View style={styles.pie}>
        <Text style={styles.ayuda}>Mantén presionado un medicamento para eliminarlo.</Text>
        <Boton titulo="+ Agregar medicamento" onPress={() => navigation.navigate("NuevoMedicamento")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  centro: { flex: 1, justifyContent: "center", backgroundColor: colores.fondo },
  lista: { padding: 16 },
  vacio: { fontSize: 17, color: colores.textoSuave, textAlign: "center", marginTop: 40 },
  tarjeta: {
    backgroundColor: colores.tarjeta,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colores.borde,
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    gap: 12,
  },
  foto: { width: 72, height: 72, borderRadius: 10 },
  sinFoto: { backgroundColor: colores.fondo, alignItems: "center", justifyContent: "center" },
  icono: { fontSize: 32 },
  info: { flex: 1 },
  nombre: { fontSize: 20, fontWeight: "700", color: colores.texto },
  dosis: { fontSize: 17, color: colores.texto, marginTop: 2 },
  horario: { fontSize: 16, color: colores.primario, marginTop: 6, fontWeight: "600" },
  notas: { fontSize: 15, color: colores.textoSuave, marginTop: 4 },
  pie: { padding: 16, borderTopWidth: 1, borderTopColor: colores.borde, backgroundColor: colores.tarjeta },
  ayuda: { fontSize: 14, color: colores.textoSuave, textAlign: "center" },
});