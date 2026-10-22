import { supabase } from "../lib/supabase";
import { EstadoToma, Toma, TomaFila } from "../models/Toma";

export class TomaRepository {
  async crearVarias(medicamentoId: number, horarioId: number, fechas: Date[]): Promise<void> {
    if (fechas.length === 0) {
      return;
    }

    const filas = fechas.map((fecha) => ({
      medicamento_id: medicamentoId,
      horario_id: horarioId,
      fecha_hora: fecha.toISOString(),
    }));

    const { error } = await supabase
      .from("tomas")
      .upsert(filas, { onConflict: "horario_id,fecha_hora", ignoreDuplicates: true });

    if (error) {
      throw new Error(error.message);
    }
  }

  async listarEntre(desde: Date, hasta: Date): Promise<Toma[]> {
    const { data, error } = await supabase
      .from("tomas")
      .select("id, medicamento_id, fecha_hora, estado, medicamentos(nombre, dosis, foto_uri)")
      .gte("fecha_hora", desde.toISOString())
      .lt("fecha_hora", hasta.toISOString())
      .order("fecha_hora");

    if (error) {
      throw new Error(error.message);
    }
    return (data as unknown as TomaFila[]).map((fila) => this.aToma(fila));
  }

  async actualizarEstado(id: number, estado: EstadoToma): Promise<void> {
    const { error } = await supabase
      .from("tomas")
      .update({ estado, confirmada_en: estado === "pendiente" ? null : new Date().toISOString() })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  }

  private aToma(fila: TomaFila): Toma {
    return new Toma(
      fila.id,
      fila.medicamento_id,
      new Date(fila.fecha_hora),
      fila.estado,
      fila.medicamentos?.nombre ?? "Medicamento",
      fila.medicamentos?.dosis ?? "",
      fila.medicamentos?.foto_uri ?? null
    );
  }
}