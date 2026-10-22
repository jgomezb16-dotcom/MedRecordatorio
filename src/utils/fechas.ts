import { ReglaHorario } from "../models/Horario";

export function esHoraValida(hora: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);
}

export function aTextoFecha(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export function sumarDias(fecha: Date, dias: number): Date {
  const resultado = new Date(fecha);
  resultado.setDate(resultado.getDate() + dias);
  return resultado;
}

export function inicioDelDia(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

function crearFechaHora(fechaTexto: string, hora: string): Date {
  const [anio, mes, dia] = fechaTexto.split("-").map(Number);
  const [horas, minutos] = hora.split(":").map(Number);
  return new Date(anio, mes - 1, dia, horas, minutos);
}

export function generarFechasDeTomas(
  regla: ReglaHorario,
  fechaInicio: string,
  fechaFin: string | null,
  desde: Date,
  hasta: Date
): Date[] {
  const limite = fechaFin ? crearFechaHora(fechaFin, "23:59") : hasta;
  const fin = limite < hasta ? limite : hasta;
  const fechas: Date[] = [];

  switch (regla.tipo) {
    case "diario": {
      let dia = crearFechaHora(fechaInicio, "00:00");
      while (dia <= fin) {
        for (const hora of regla.horas) {
          const fecha = crearFechaHora(aTextoFecha(dia), hora);
          if (fecha >= desde && fecha <= fin) {
            fechas.push(fecha);
          }
        }
        dia = sumarDias(dia, 1);
      }
      break;
    }
    case "intervalo": {
      let fecha = crearFechaHora(fechaInicio, regla.horaInicio);
      while (fecha <= fin) {
        if (fecha >= desde) {
          fechas.push(fecha);
        }
        fecha = new Date(fecha.getTime() + regla.cadaHoras * 60 * 60 * 1000);
      }
      break;
    }
  }

  return fechas.sort((a, b) => a.getTime() - b.getTime());
}