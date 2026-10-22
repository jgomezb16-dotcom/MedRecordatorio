export type ReglaHorario =
  | { tipo: "diario"; horas: string[] }
  | { tipo: "intervalo"; cadaHoras: number; horaInicio: string };

export class Horario {
  id: number;
  medicamentoId: number;
  regla: ReglaHorario;
  fechaInicio: string;
  fechaFin: string | null;

  constructor(
    id: number,
    medicamentoId: number,
    regla: ReglaHorario,
    fechaInicio: string,
    fechaFin: string | null
  ) {
    this.id = id;
    this.medicamentoId = medicamentoId;
    this.regla = regla;
    this.fechaInicio = fechaInicio;
    this.fechaFin = fechaFin;
  }

  describir(): string {
    switch (this.regla.tipo) {
      case "diario":
        return `Diario a las ${this.regla.horas.join(", ")}`;
      case "intervalo":
        return `Cada ${this.regla.cadaHoras} h desde las ${this.regla.horaInicio}`;
    }
  }
}

export interface HorarioFila {
  id: number;
  medicamento_id: number;
  tipo: "diario" | "intervalo";
  horas: string[] | null;
  cada_horas: number | null;
  hora_inicio: string | null;
  fecha_inicio: string;
  fecha_fin: string | null;
}