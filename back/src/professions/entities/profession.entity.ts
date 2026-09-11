import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProfessionalStatus, ProfessionalType } from '../../common/enums';

@Entity('professions')
export class Profession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string;

  /** Papel na agenda: responsável (PROFESSIONAL) ou auxiliar (ASSISTANT). */
  @Column({
    type: 'enum',
    enum: ProfessionalType,
    enumName: 'professional_type_enum',
  })
  category!: ProfessionalType;

  @Index('IDX_professions_status')
  @Column({
    type: 'enum',
    enum: ProfessionalStatus,
    enumName: 'professional_status_enum',
    default: ProfessionalStatus.ACTIVE,
  })
  status!: ProfessionalStatus;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
