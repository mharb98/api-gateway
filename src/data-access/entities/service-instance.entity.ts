import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Service } from './service.entity';
import { BaseEntity } from './base.entity';

@Entity('service_instances')
export class ServiceInstance extends BaseEntity {
  @Index()
  @Column({ name: 'service_id', type: 'int' })
  serviceId: number;

  @Column({ type: 'varchar', length: 255 })
  host: string;

  @Column({ type: 'int' })
  port: number;

  @Column({ type: 'int', default: 1 })
  weight: number;

  @Index()
  @Column({ name: 'is_healthy', type: 'boolean', default: true })
  isHealthy: boolean;

  @ManyToOne(() => Service, (service) => service.instances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
