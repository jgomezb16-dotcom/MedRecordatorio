import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { FotoService } from "../services/FotoService";
import { colores } from "../theme";

interface Props {
  fotoUri: string | null;
  onCambiar: (uri: string | null) => void;
}

const fotoService = new FotoService();

export function SelectorFoto({ fotoUri, onCambiar }: Props) {
  async function seleccionar(origen: "camara" | "galeria") {
    try {
      const uri = origen === "camara" ? await fotoService.tomarFoto() : await fotoService.elegirDeGaleria();
      if (uri) {
        onCambiar(uri);
      }
    } catch (e: unknown) {
      Alert.alert("Foto", e instanceof Error ? e.message : "No se pudo obtener la foto.");
    }
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>Foto de la caja (opcional)</Text>
      {fotoUri ? (
        <Image source={{ uri: fotoUri }} style={styles.foto} />
      ) : (
        <View style={[styles.foto, styles.vacia]}>
          <Text style={styles.icono}>📦</Text>
        </View>
      )}
      <View style={styles.botones}>
        <Pressable style={styles.boton} onPress={() => seleccionar("camara")}>
          <Text style={styles.textoBoton}>📷 Cámara</Text>
        </Pressable>
        <Pressable style={styles.boton} onPress={() => seleccionar("galeria")}>
          <Text style={styles.textoBoton}>🖼️ Galería</Text>
        </Pressable>
        {fotoUri && (
          <Pressable style={styles.boton} onPress={() => onCambiar(null)}>
            <Text style={[styles.textoBoton, { color: colores.peligro }]}>Quitar</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { marginBottom: 14 },
  etiqueta: { fontSize: 17, fontWeight: "600", color: colores.texto, marginBottom: 6 },
  foto: { width: "100%", height: 180, borderRadius: 12 },
  vacia: {
    backgroundColor: colores.tarjeta,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: colores.borde,
    alignItems: "center",
    justifyContent: "center",
  },
  icono: { fontSize: 48 },
  botones: { flexDirection: "row", gap: 8, marginTop: 8 },
  boton: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colores.borde,
    backgroundColor: colores.tarjeta,
    alignItems: "center",
  },
  textoBoton: { fontSize: 15, fontWeight: "600", color: colores.primario },
});