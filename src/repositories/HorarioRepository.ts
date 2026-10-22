import { supabase } from "../lib/supabase";
import { Horario, HorarioFila, ReglaHorario } from "../models/Horario";

export class HorarioRepository {
  async listar(): Promise<Horario[]> {
    const { data, error } = await supabase
      .from("horarios")
      .select("id, medicamento_id, tipo, horas, cada_horas, hora_inicio, fecha_inicio, fecha_fin");

    if (error) {
      throw new Error(error.message);
    }
    return (data as HorarioFila[]).map((fila) => this.aHorario(fila));
  }

  async crear(
    medicamentoId: number,
    regla: ReglaHorario,
    fechaInicio: string,
    fechaFin: string | null
  ): Promise<Horario> {
    const { data, error } = await supabase
      .from("horarios")
      .insert({
        medicamento_id: medicamentoId,
        tipo: regla.tipo,
        horas: regla.tipo === "diario" ? regla.horas : null,
        cada_horas: regla.tipo === "intervalo" ? regla.cadaHoras : null,
        hora_inicio: regla.tipo === "intervalo" ? regla.horaInicio : null,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      })
      .select("id, medicamento_id, tipo, horas, cada_horas, hora_inicio, fecha_inicio, fecha_fin")
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return this.aHorario(data as HorarioFila);
  }

  private aHorario(fila: HorarioFila): Horario {
    const regla: ReglaHorario =
      fila.tipo === "diario"
        ? { tipo: "diario", horas: fila.horas ?? [] }
        : { tipo: "intervalo", cadaHoras: fila.cada_horas ?? 24, horaInicio: fila.hora_inicio ?? "00:00" };

    return new Horario(fila.id, fila.medicamento_id, regla, fila.fecha_inicio, fila.fecha_fin);
  }
}