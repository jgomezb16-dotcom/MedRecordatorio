export type EstadoToma = "pendiente" | "tomado" | "omitido";

export class Toma {
  id: number;
  medicamentoId: number;
  fechaHora: Date;
  estado: EstadoToma;
  nombreMedicamento: string;
  dosis: string;
  fotoUri: string | null;

  constructor(
    id: number,
    medicamentoId: number,
    fechaHora: Date,
    estado: EstadoToma,
    nombreMedicamento: string,
    dosis: string,
    fotoUri: string | null
  ) {
    this.id = id;
    this.medicamentoId = medicamentoId;
    this.fechaHora = fechaHora;
    this.estado = estado;
    this.nombreMedicamento = nombreMedicamento;
    this.dosis = dosis;
    this.fotoUri = fotoUri;
  }

  estaAtrasada(): boolean {
    return this.estado === "pendiente" && this.fechaHora < new Date();
  }
}

export interface TomaFila {
  id: number;
  medicamento_id: number;
  fecha_hora: string;
  estado: EstadoToma;
  medicamentos: { nombre: string; dosis: string; foto_uri: string | null } | null;
}