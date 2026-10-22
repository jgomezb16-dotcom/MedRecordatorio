export class Medicamento {
  id: number;
  nombre: string;
  dosis: string;
  notas: string | null;
  fotoUri: string | null;

  constructor(id: number, nombre: string, dosis: string, notas: string | null, fotoUri: string | null) {
    this.id = id;
    this.nombre = nombre;
    this.dosis = dosis;
    this.notas = notas;
    this.fotoUri = fotoUri;
  }
}

export interface MedicamentoFila {
  id: number;
  nombre: string;
  dosis: string;
  notas: string | null;
  foto_uri: string | null;
}