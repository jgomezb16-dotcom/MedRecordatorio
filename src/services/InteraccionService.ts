import { supabase } from "../lib/supabase";
import { Medicamento } from "../models/Medicamento";

export type NivelInteraccion = "ninguna" | "precaucion" | "grave";

export interface Interaccion {
  medicamentos: string;
  descripcion: string;
}

export interface ResultadoInteraccion {
  nivel: NivelInteraccion;
  interacciones: Interaccion[];
}

function esInteraccion(valor: unknown): valor is Interaccion {
  return (
    typeof valor === "object" &&
    valor !== null &&
    typeof (valor as Interaccion).medicamentos === "string" &&
    typeof (valor as Interaccion).descripcion === "string"
  );
}

function esResultadoInteraccion(valor: unknown): valor is ResultadoInteraccion {
  if (typeof valor !== "object" || valor === null) {
    return false;
  }
  const resultado = valor as ResultadoInteraccion;
  return (
    ["ninguna", "precaucion", "grave"].includes(resultado.nivel) &&
    Array.isArray(resultado.interacciones) &&
    resultado.interacciones.every(esInteraccion)
  );
}

export class InteraccionService {
  async verificar(nombre: string, dosis: string, actuales: Medicamento[]): Promise<ResultadoInteraccion> {
    if (actuales.length === 0) {
      return { nivel: "ninguna", interacciones: [] };
    }

    const { data, error } = await supabase.functions.invoke("verificar-interacciones", {
      body: {
        nuevo: `${nombre} ${dosis}`.trim(),
        actuales: actuales.map((m) => `${m.nombre} ${m.dosis}`.trim()),
      },
    });

    if (error) {
      throw new Error("No se pudo consultar la verificación de interacciones.");
    }

    const respuesta: unknown = data;
    if (!esResultadoInteraccion(respuesta)) {
      throw new Error("La respuesta de la verificación no tiene el formato esperado.");
    }
    return respuesta;
  }
}