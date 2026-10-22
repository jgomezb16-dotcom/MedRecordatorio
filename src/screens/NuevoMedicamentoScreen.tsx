import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppStackParamList } from "../navigation/tipos";
import { MedicamentoService } from "../services/MedicamentoService";
import { InteraccionService, ResultadoInteraccion } from "../services/InteraccionService";
import { ReglaHorario } from "../models/Horario";
import { CampoTexto } from "../components/CampoTexto";
import { SelectorFoto } from "../components/SelectorFoto";
import { Boton } from "../components/Boton";
import { colores } from "../theme";

type Props = NativeStackScreenProps<AppStackParamList, "NuevoMedicamento">;
type TipoHorario = ReglaHorario["tipo"];

const medicamentoService = new MedicamentoService();
const interaccionService = new InteraccionService();

function preguntar(titulo: string, mensaje: string): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      titulo,
      mensaje,
      [
        { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
        { text: "Guardar de todos modos", onPress: () => resolve(true) },
      ],
      { cancelable: false }
    );
  });
}

function describirResultado(resultado: ResultadoInteraccion): string {
  const detalle = resultado.interacciones.map((i) => `• ${i.medicamentos}: ${i.descripcion}`).join("\n\n");
  return `${detalle}\n\nEsta verificación es informativa. Consulta a tu médico o farmacéutico.`;
}

export default function NuevoMedicamentoScreen({ navigation }: Props) {
  const [nombre, setNombre] = useState<string>("");
  const [dosis, setDosis] = useState<string>("");
  const [notas, setNotas] = useState<string>("");
  const [fotoUri, setFotoUri] = useState<string | null>(null);
  const [tipo, setTipo] = useState<TipoHorario>("diario");
  const [horas, setHoras] = useState<string>("08:00, 20:00");
  const [cadaHoras, setCadaHoras] = useState<string>("8");
  const [horaInicio, setHoraInicio] = useState<string>("06:00");
  const [dias, setDias] = useState<string>("");
  const [guardando, setGuardando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  function construirRegla(): ReglaHorario {
    if (tipo === "diario") {
      const lista = horas.split(",").map((h) => h.trim()).filter((h) => h.length > 0);
      return { tipo: "diario", horas: lista };
    }
    return { tipo: "intervalo", cadaHoras: Number(cadaHoras), horaInicio: horaInicio.trim() };
  }

  async function confirmarInteracciones(): Promise<boolean> {
    try {
      const actuales = (await medicamentoService.listar()).map((m) => m.medicamento);
      const resultado = await interaccionService.verificar(nombre, dosis, actuales);

      if (resultado.nivel === "ninguna") {
        return true;
      }
      const titulo = resultado.nivel === "grave" ? "⚠️ Interacción grave" : "⚠️ Precaución";
      return preguntar(titulo, describirResultado(resultado));
    } catch {
      return preguntar(
        "No se pudo verificar",
        "No se pudieron revisar las interacciones con tus otros medicamentos. ¿Deseas guardarlo de todos modos?"
      );
    }
  }

  async function guardar() {
    setError(null);
    if (!nombre.trim() || !dosis.trim()) {
      setError("Escribe el nombre y la dosis del medicamento.");
      return;
    }

    setGuardando(true);
    try {
      const continuar = await confirmarInteracciones();
      if (!continuar) {
        return;
      }

      await medicamentoService.crear({
        nombre,
        dosis,
        notas,
        fotoUri,
        regla: construirRegla(),
        diasTratamiento: dias.trim() ? Number(dias) : null,
      });
      navigation.goBack();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el medicamento.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.pantalla} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <CampoTexto etiqueta="Nombre" value={nombre} onChangeText={setNombre} placeholder="Ej. Amoxicilina" />
        <CampoTexto etiqueta="Dosis" value={dosis} onChangeText={setDosis} placeholder="Ej. 500 mg" />
        <CampoTexto
          etiqueta="Notas (opcional)"
          value={notas}
          onChangeText={setNotas}
          placeholder="Ej. Tomar con comida"
        />

        <SelectorFoto fotoUri={fotoUri} onCambiar={setFotoUri} />

        <Text style={styles.etiqueta}>Horario</Text>
        <View style={styles.selector}>
          <Pressable
            style={[styles.opcion, tipo === "diario" && styles.opcionActiva]}
            onPress={() => setTipo("diario")}
          >
            <Text style={[styles.textoOpcion, tipo === "diario" && styles.textoActivo]}>Horas fijas</Text>
          </Pressable>
          <Pressable
            style={[styles.opcion, tipo === "intervalo" && styles.opcionActiva]}
            onPress={() => setTipo("intervalo")}
          >
            <Text style={[styles.textoOpcion, tipo === "intervalo" && styles.textoActivo]}>Cada X horas</Text>
          </Pressable>
        </View>

        {tipo === "diario" ? (
          <CampoTexto
            etiqueta="Horas del día (separadas por coma)"
            value={horas}
            onChangeText={setHoras}
            placeholder="08:00, 20:00"
          />
        ) : (
          <>
            <CampoTexto
              etiqueta="Cada cuántas horas"
              value={cadaHoras}
              onChangeText={setCadaHoras}
              keyboardType="number-pad"
              placeholder="8"
            />
            <CampoTexto
              etiqueta="Hora de la primera toma"
              value={horaInicio}
              onChangeText={setHoraInicio}
              placeholder="06:00"
            />
          </>
        )}

        <CampoTexto
          etiqueta="Días de tratamiento (vacío = sin fin)"
          value={dias}
          onChangeText={setDias}
          keyboardType="number-pad"
          placeholder="Ej. 7"
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Boton titulo="Guardar" onPress={guardar} cargando={guardando} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 16, paddingBottom: 40 },
  etiqueta: { fontSize: 17, fontWeight: "600", color: colores.texto, marginBottom: 6 },
  selector: { flexDirection: "row", gap: 8, marginBottom: 14 },
  opcion: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colores.primario,
    alignItems: "center",
  },
  opcionActiva: { backgroundColor: colores.primario },
  textoOpcion: { fontSize: 16, fontWeight: "600", color: colores.primario },
  textoActivo: { color: "#FFFFFF" },
  error: { color: colores.peligro, fontSize: 16, marginTop: 4 },
});