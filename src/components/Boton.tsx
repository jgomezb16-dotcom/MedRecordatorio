import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { colores } from "../theme";

type Variante = "primario" | "peligro";

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: Variante;
  cargando?: boolean;
}

export function Boton({ titulo, onPress, variante = "primario", cargando = false }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={cargando}
      style={({ pressed }) => [styles.base, styles[variante], pressed && { opacity: 0.8 }]}
    >
      {cargando ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={styles.texto}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  primario: { backgroundColor: colores.primario },
  peligro: { backgroundColor: colores.peligro },
  texto: { color: "#FFFFFF", fontSize: 19, fontWeight: "600" },
});