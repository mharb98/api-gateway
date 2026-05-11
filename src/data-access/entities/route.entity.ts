import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Service } from './service.entity';
import { BaseEntity } from './base.entity';

export const HttpMethod = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  OPTIONS: 'OPTIONS',
  HEAD: 'HEAD',
} as const;

export type HttpMethod = (typeof HttpMethod)[keyof typeof HttpMethod];

@Entity('routes')
export class Route extends BaseEntity {
  @Index()
  @Column({ name: 'service_id', type: 'int' })
  serviceId: number;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  host: string | null;

  @Index()
  @Column({ name: 'path_pattern', type: 'varchar', length: 255 })
  pathPattern: string;

  @Index()
  @Column({ type: 'enum', enum: Object.values(HttpMethod), nullable: true, default: null })
  method: HttpMethod | null;

  @Column({ name: 'strip_prefix', type: 'boolean', default: false })
  stripPrefix: boolean;

  @Index()
  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  isEnabled: boolean;

  @ManyToOne(() => Service, (service) => service.routes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'service_id' })
  service: Service;
}
