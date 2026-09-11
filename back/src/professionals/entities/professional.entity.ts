import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ProfessionalStatus, ProfessionalType } from '../../common/enums';

@Entity('professionals')
export class Professional {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 20 })
  phone!: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: ProfessionalType,
    enumName: 'professional_type_enum',
  })
  type!: ProfessionalType;

  @Index('IDX_professionals_status')
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
