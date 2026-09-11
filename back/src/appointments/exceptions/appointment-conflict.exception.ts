import { ConflictException } from '@nestjs/common';

export class AppointmentConflictException extends ConflictException {
  constructor(professionalName: string) {
    super({
      statusCode: 409,
      error: 'Conflict',
      message: `Este profissional já possui um atendimento neste horário: ${professionalName}.`,
      code: 'APPOINTMENT_SCHEDULE_CONFLICT',
      professionalName,
    });
  }
}
