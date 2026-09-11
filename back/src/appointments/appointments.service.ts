import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  AppointmentStatus,
  ParticipationType,
  PatientStatus,
  ProfessionalStatus,
  ProfessionalType,
} from '../common/enums';
import {
  addMinutes,
  buildDateTimeInAppTimezone,
  endOfDayInAppTimezone,
  formatDateInAppTimezone,
  formatTimeInAppTimezone,
  startOfDayInAppTimezone,
} from '../common/utils/datetime.util';
import { Patient } from '../patients/entities/patient.entity';
import { Professional } from '../professionals/entities/professional.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { ListAppointmentsQueryDto } from './dto/list-appointments-query.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AppointmentParticipant } from './entities/appointment-participant.entity';
import { Appointment } from './entities/appointment.entity';
import { AppointmentConflictException } from './exceptions/appointment-conflict.exception';

type ScheduleInput = {
  patientId: string;
  responsibleProfessionalId: string;
  assistantProfessionalId?: string | null;
  date: string;
  startTime: string;
  durationMinutes: number;
  notes?: string | null;
};

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(AppointmentParticipant)
    private readonly participantRepository: Repository<AppointmentParticipant>,
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
    @InjectRepository(Professional)
    private readonly professionalRepository: Repository<Professional>,
  ) {}

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    return this.saveAppointment(dto);
  }

  async update(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
    const existing = await this.findOne(id);

    if (
      existing.status === AppointmentStatus.CANCELLED ||
      existing.status === AppointmentStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Agendamento cancelado ou concluído não pode ser editado',
      );
    }

    const merged: ScheduleInput = {
      patientId: dto.patientId ?? existing.patientId,
      responsibleProfessionalId:
        dto.responsibleProfessionalId ?? this.getResponsibleId(existing) ?? '',
      assistantProfessionalId:
        dto.assistantProfessionalId !== undefined
          ? dto.assistantProfessionalId
          : this.getAssistantId(existing),
      date: dto.date ?? this.toDatePart(existing.startAt),
      startTime: dto.startTime ?? this.toTimePart(existing.startAt),
      durationMinutes: dto.durationMinutes ?? existing.durationMinutes,
      notes: dto.notes !== undefined ? dto.notes : existing.notes,
    };

    if (!merged.responsibleProfessionalId) {
      throw new BadRequestException(
        'Agendamento precisa de um profissional responsável',
      );
    }

    return this.saveAppointment(merged, id);
  }

  async findAll(query: ListAppointmentsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const qb = this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.patient', 'patient')
      .leftJoinAndSelect('appointment.participants', 'participants')
      .leftJoinAndSelect('participants.professional', 'professional')
      .orderBy('appointment.startAt', 'ASC');

    if (query.startDate) {
      qb.andWhere('appointment.start_at >= :startDate', {
        startDate: startOfDayInAppTimezone(query.startDate),
      });
    }

    if (query.endDate) {
      qb.andWhere('appointment.start_at < :endDate', {
        endDate: endOfDayInAppTimezone(query.endDate),
      });
    }

    if (query.status) {
      qb.andWhere('appointment.status = :status', { status: query.status });
    }

    if (query.professionalId) {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM appointment_participants ap
          WHERE ap.appointment_id = appointment.id
            AND ap.professional_id = :professionalId
        )`,
        { professionalId: query.professionalId },
      );
    }

    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: {
        patient: true,
        participants: { professional: true },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Agendamento não encontrado');
    }

    return appointment;
  }

  async confirm(id: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException(
        'Agendamento cancelado não pode ser confirmado',
      );
    }
    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Agendamento já concluído');
    }
    appointment.status = AppointmentStatus.CONFIRMED;
    return this.appointmentRepository.save(appointment);
  }

  async complete(id: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException(
        'Agendamento cancelado não pode ser concluído',
      );
    }
    appointment.status = AppointmentStatus.COMPLETED;
    return this.appointmentRepository.save(appointment);
  }

  async cancel(id: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException(
        'Agendamento concluído não pode ser cancelado',
      );
    }
    appointment.status = AppointmentStatus.CANCELLED;
    return this.appointmentRepository.save(appointment);
  }

  private async saveAppointment(
    input: ScheduleInput,
    appointmentId?: string,
  ): Promise<Appointment> {
    if (input.durationMinutes <= 0) {
      throw new BadRequestException('Duração deve ser maior que zero');
    }

    if (
      input.assistantProfessionalId &&
      input.assistantProfessionalId === input.responsibleProfessionalId
    ) {
      throw new BadRequestException(
        'O auxiliar deve ser diferente do dentista responsável',
      );
    }

    const startAt = buildDateTimeInAppTimezone(input.date, input.startTime);
    const endAt = addMinutes(startAt, input.durationMinutes);

    if (endAt.getTime() <= startAt.getTime()) {
      throw new BadRequestException(
        'Horário final deve ser posterior ao horário inicial',
      );
    }

    const patient = await this.patientRepository.findOne({
      where: { id: input.patientId },
    });
    if (!patient) {
      throw new NotFoundException('Paciente não encontrado');
    }
    if (patient.status !== PatientStatus.CONFIRMED) {
      throw new BadRequestException(
        'Somente pacientes confirmados podem ser agendados',
      );
    }

    const responsible = await this.professionalRepository.findOne({
      where: { id: input.responsibleProfessionalId },
    });
    if (!responsible) {
      throw new NotFoundException('Dentista responsável não encontrado');
    }
    if (responsible.status !== ProfessionalStatus.ACTIVE) {
      throw new BadRequestException(
        'Profissional responsável inativo não pode ser agendado',
      );
    }
    if (responsible.type !== ProfessionalType.DENTIST) {
      throw new BadRequestException('O responsável deve ser um dentista');
    }

    let assistant: Professional | null = null;
    if (input.assistantProfessionalId) {
      assistant = await this.professionalRepository.findOne({
        where: { id: input.assistantProfessionalId },
      });
      if (!assistant) {
        throw new NotFoundException('Auxiliar não encontrado');
      }
      if (assistant.status !== ProfessionalStatus.ACTIVE) {
        throw new BadRequestException('Auxiliar inativo não pode ser agendado');
      }
      if (assistant.type !== ProfessionalType.ASSISTANT) {
        throw new BadRequestException(
          'O auxiliar selecionado precisa ser do tipo auxiliar',
        );
      }
    }

    const professionalIds = [responsible.id];
    if (assistant) {
      professionalIds.push(assistant.id);
    }

    await this.assertNoConflicts(
      professionalIds,
      startAt,
      endAt,
      appointmentId,
    );

    return this.dataSource.transaction(async (manager) => {
      const appointmentRepo = manager.getRepository(Appointment);
      const participantRepo = manager.getRepository(AppointmentParticipant);

      let appointment: Appointment;

      if (appointmentId) {
        const existing = await appointmentRepo.findOne({
          where: { id: appointmentId },
          relations: { participants: true },
        });
        if (!existing) {
          throw new NotFoundException('Agendamento não encontrado');
        }

        existing.patientId = input.patientId;
        existing.startAt = startAt;
        existing.endAt = endAt;
        existing.durationMinutes = input.durationMinutes;
        existing.notes = input.notes?.trim() ? input.notes.trim() : null;

        appointment = await appointmentRepo.save(existing);
        await participantRepo.delete({ appointmentId: appointment.id });
      } else {
        appointment = await appointmentRepo.save(
          appointmentRepo.create({
            patientId: input.patientId,
            startAt,
            endAt,
            durationMinutes: input.durationMinutes,
            status: AppointmentStatus.SCHEDULED,
            notes: input.notes?.trim() ? input.notes.trim() : null,
          }),
        );
      }

      const participants = [
        participantRepo.create({
          appointmentId: appointment.id,
          professionalId: responsible.id,
          participationType: ParticipationType.RESPONSIBLE,
        }),
      ];

      if (assistant) {
        participants.push(
          participantRepo.create({
            appointmentId: appointment.id,
            professionalId: assistant.id,
            participationType: ParticipationType.ASSISTANT,
          }),
        );
      }

      await participantRepo.save(participants);

      const full = await appointmentRepo.findOne({
        where: { id: appointment.id },
        relations: {
          patient: true,
          participants: { professional: true },
        },
      });

      if (!full) {
        throw new NotFoundException('Agendamento não encontrado após salvar');
      }

      return full;
    });
  }

  private async assertNoConflicts(
    professionalIds: string[],
    startAt: Date,
    endAt: Date,
    excludeAppointmentId?: string,
  ): Promise<void> {
    for (const professionalId of professionalIds) {
      const qb = this.participantRepository
        .createQueryBuilder('participant')
        .innerJoinAndSelect('participant.appointment', 'appointment')
        .innerJoinAndSelect('participant.professional', 'professional')
        .where('participant.professional_id = :professionalId', {
          professionalId,
        })
        .andWhere('appointment.status != :cancelled', {
          cancelled: AppointmentStatus.CANCELLED,
        })
        .andWhere('appointment.start_at < :endAt', { endAt })
        .andWhere('appointment.end_at > :startAt', { startAt });

      if (excludeAppointmentId) {
        qb.andWhere('appointment.id != :excludeAppointmentId', {
          excludeAppointmentId,
        });
      }

      const conflict = await qb.getOne();
      if (conflict) {
        throw new AppointmentConflictException(
          conflict.professional?.name ?? 'Profissional',
        );
      }
    }
  }

  private getResponsibleId(appointment: Appointment): string | null {
    return (
      appointment.participants?.find(
        (item) => item.participationType === ParticipationType.RESPONSIBLE,
      )?.professionalId ?? null
    );
  }

  private getAssistantId(appointment: Appointment): string | null {
    return (
      appointment.participants?.find(
        (item) => item.participationType === ParticipationType.ASSISTANT,
      )?.professionalId ?? null
    );
  }

  private toDatePart(date: Date): string {
    return formatDateInAppTimezone(date);
  }

  private toTimePart(date: Date): string {
    return formatTimeInAppTimezone(date);
  }
}
