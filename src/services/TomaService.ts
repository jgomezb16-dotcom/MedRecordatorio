import { EstadoToma, Toma } from "../models/Toma";
import { HorarioRepository } from "../repositories/HorarioRepository";
import { TomaRepository } from "../repositories/TomaRepository";
import { NotificacionService } from "./NotificacionService";
import { generarFechasDeTomas, inicioDelDia, sumarDias } from "../utils/fechas";

const DIAS_A_GENERAR = 7;

export interface Cumplimiento {
  medicamentoId: number;
  nombre: string;
  tomadas: number;
  total: number;
  porcentaje: number;
}

export interface Historial {
  cumplimiento: Cumplimiento[];
  tomas: Toma[];
}

export class TomaService {
  private tomaRepository = new TomaRepository();
  private horarioRepository = new HorarioRepository();
  private notificacionService = new NotificacionService();

  async generarProximasTomas(): Promise<void> {
    const horarios = await this.horarioRepository.listar();
    const ahora = new Date();
    const hasta = sumarDias(inicioDelDia(ahora), DIAS_A_GENERAR);

    for (const horario of horarios) {
      const fechas = generarFechasDeTomas(
        horario.regla,
        horario.fechaInicio,
        horario.fechaFin,
        ahora,
        hasta
      );
      await this.tomaRepository.crearVarias(horario.medicamentoId, horario.id, fechas);
    }

    const proximas = await this.tomaRepository.listarEntre(ahora, hasta);
    await this.notificacionService.reprogramar(proximas);
  }

  async listarHoy(): Promise<Toma[]> {
    const hoy = inicioDelDia(new Date());
    return this.tomaRepository.listarEntre(hoy, sumarDias(hoy, 1));
  }

  async marcar(id: number, estado: EstadoToma): Promise<void> {
    await this.tomaRepository.actualizarEstado(id, estado);
  }

  async obtenerHistorial(): Promise<Historial> {
    const tomas = await this.tomaRepository.listarEntre(new Date(0), new Date());
    const porMedicamento = new Map<number, Cumplimiento>();

    for (const toma of tomas) {
      const actual = porMedicamento.get(toma.medicamentoId) ?? {
        medicamentoId: toma.medicamentoId,
        nombre: toma.nombreMedicamento,
        tomadas: 0,
        total: 0,
        porcentaje: 0,
      };
      actual.total++;
      if (toma.estado === "tomado") {
        actual.tomadas++;
      }
      actual.porcentaje = Math.round((actual.tomadas / actual.total) * 100);
      porMedicamento.set(toma.medicamentoId, actual);
    }

    return {
      cumplimiento: Array.from(porMedicamento.values()),
      tomas: tomas.reverse(),
    };
  }
}