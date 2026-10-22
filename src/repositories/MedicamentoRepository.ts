import { supabase } from "../lib/supabase";
import { Medicamento, MedicamentoFila } from "../models/Medicamento";

export class MedicamentoRepository {
  async listar(): Promise<Medicamento[]> {
    const { data, error } = await supabase
      .from("medicamentos")
      .select("id, nombre, dosis, notas, foto_uri")
      .order("nombre");

    if (error) {
      throw new Error(error.message);
    }
    return (data as MedicamentoFila[]).map((fila) => this.aMedicamento(fila));
  }

  async crear(
    nombre: string,
    dosis: string,
    notas: string | null,
    fotoUri: string | null
  ): Promise<Medicamento> {
    const { data, error } = await supabase
      .from("medicamentos")
      .insert({ nombre, dosis, notas, foto_uri: fotoUri })
      .select("id, nombre, dosis, notas, foto_uri")
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return this.aMedicamento(data as MedicamentoFila);
  }

  async eliminar(id: number): Promise<void> {
    const { error } = await supabase.from("medicamentos").delete().eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  }

  private aMedicamento(fila: MedicamentoFila): Medicamento {
    return new Medicamento(fila.id, fila.nombre, fila.dosis, fila.notas, fila.foto_uri);
  }
}