import { Horario, ReglaHorario } from "../models/Horario";
import { Medicamento } from "../models/Medicamento";
import { HorarioRepository } from "../repositories/HorarioRepository";
import { MedicamentoRepository } from "../repositories/MedicamentoRepository";
import { aTextoFecha, esHoraValida, sumarDias } from "../utils/fechas";
import { TomaService } from "./TomaService";

export interface NuevoMedicamento {
  nombre: string;
  dosis: string;
  notas: string;
  fotoUri: string | null;
  regla: ReglaHorario;
  diasTratamiento: number | null;
}

export interface MedicamentoConHorario {
  medicamento: Medicamento;
  horario: Horario | null;
}

export class MedicamentoService {
  private medicamentoRepository = new MedicamentoRepository();
  private horarioRepository = new HorarioRepository();
  private tomaService = new TomaService();

  async listar(): Promise<MedicamentoConHorario[]> {
    const [medicamentos, horarios] = await Promise.all([
      this.medicamentoRepository.listar(),
      this.horarioRepository.listar(),
    ]);

    return medicamentos.map((medicamento) => ({
      medicamento,
      horario: horarios.find((h) => h.medicamentoId === medicamento.id) ?? null,
    }));
  }

  async crear(datos: NuevoMedicamento): Promise<void> {
    this.validar(datos);

    const medicamento = await this.medicamentoRepository.crear(
      datos.nombre.trim(),
      datos.dosis.trim(),
      datos.notas.trim() || null,
      datos.fotoUri
    );

    const hoy = new Date();
    const fechaFin =
      datos.diasTratamiento !== null ? aTextoFecha(sumarDias(hoy, datos.diasTratamiento - 1)) : null;

    try {
      await this.horarioRepository.crear(medicamento.id, datos.regla, aTextoFecha(hoy), fechaFin);
    } catch (e: unknown) {
      await this.medicamentoRepository.eliminar(medicamento.id);
      throw e;
    }

    await this.tomaService.generarProximasTomas();
  }

  async eliminar(id: number): Promise<void> {
    await this.medicamentoRepository.eliminar(id);
    await this.tomaService.generarProximasTomas();
  }

  private validar(datos: NuevoMedicamento): void {
    if (!datos.nombre.trim()) {
      throw new Error("Escribe el nombre del medicamento.");
    }
    if (!datos.dosis.trim()) {
      throw new Error("Escribe la dosis, por ejemplo 500 mg.");
    }

    switch (datos.regla.tipo) {
      case "diario":
        if (datos.regla.horas.length === 0 || !datos.regla.horas.every(esHoraValida)) {
          throw new Error("Escribe las horas en formato HH:MM, por ejemplo 08:00, 20:00.");
        }
        break;
      case "intervalo":
        if (!Number.isInteger(datos.regla.cadaHoras) || datos.regla.cadaHoras < 1 || datos.regla.cadaHoras > 24) {
          throw new Error("Las horas entre tomas deben ser un número entre 1 y 24.");
        }
        if (!esHoraValida(datos.regla.horaInicio)) {
          throw new Error("Escribe la hora de inicio en formato HH:MM, por ejemplo 06:00.");
        }
        break;
    }

    if (datos.diasTratamiento !== null) {
      if (!Number.isInteger(datos.diasTratamiento) || datos.diasTratamiento < 1) {
        throw new Error("Los días de tratamiento deben ser un número mayor a 0.");
      }
    }
  }
}