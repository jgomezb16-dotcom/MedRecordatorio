import * as ImagePicker from "expo-image-picker";
import { File, Paths } from "expo-file-system";

export class FotoService {
  async tomarFoto(): Promise<string | null> {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) {
      throw new Error("Necesitas permitir el acceso a la cámara.");
    }

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.5,
    });
    return this.guardar(resultado);
  }

  async elegirDeGaleria(): Promise<string | null> {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.5,
    });
    return this.guardar(resultado);
  }

  private guardar(resultado: ImagePicker.ImagePickerResult): string | null {
    if (resultado.canceled) {
      return null;
    }

    const origen = new File(resultado.assets[0].uri);
    const destino = new File(Paths.document, `medicamento-${Date.now()}.jpg`);
    origen.copy(destino);
    return destino.uri;
  }
}