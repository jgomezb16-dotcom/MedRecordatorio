import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colores } from "../theme";

interface Props extends TextInputProps {
  etiqueta: string;
}

export function CampoTexto({ etiqueta, ...props }: Props) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput style={styles.input} placeholderTextColor={colores.textoSuave} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { marginBottom: 14 },
  etiqueta: { fontSize: 17, fontWeight: "600", color: colores.texto, marginBottom: 6 },
  input: {
    backgroundColor: colores.tarjeta,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    color: colores.texto,
  },
});