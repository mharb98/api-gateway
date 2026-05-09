import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Service } from './service.entity';

@Entity('service_instances')
export class ServiceInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'service_id', type: 'uuid' })
  serviceId: string;

  @Column({ type: 'varchar', length: 255 })
  host: string;

  @Column({ type: 'int' })
  port: number;

  @Column({ type: 'int', default: 1 })
  weight: number;

  @Index()
  @Column({ name: 'is_healthy', type: 'boolean', default: true })
  isHealthy: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Service, (service) => service.instances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
