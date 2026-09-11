import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ParticipationType } from '../../common/enums';
import { Professional } from '../../professionals/entities/professional.entity';
import { Appointment } from './appointment.entity';

@Entity('appointment_participants')
@Unique('UQ_appointment_participants_appointment_professional', [
  'appointmentId',
  'professionalId',
])
export class AppointmentParticipant {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index('IDX_appointment_participants_appointment_id')
  @Column({ name: 'appointment_id', type: 'uuid' })
  appointmentId!: string;

  @ManyToOne(() => Appointment, (appointment) => appointment.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'appointment_id' })
  appointment!: Appointment;

  @Index('IDX_appointment_participants_professional_id')
  @Column({ name: 'professional_id', type: 'uuid' })
  professionalId!: string;

  @ManyToOne(() => Professional, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'professional_id' })
  professional!: Professional;

  @Column({
    name: 'participation_type',
    type: 'enum',
    enum: ParticipationType,
    enumName: 'participation_type_enum',
  })
  participationType!: ParticipationType;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
