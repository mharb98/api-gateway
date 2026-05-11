import { Column, Entity, OneToMany } from 'typeorm';
import { ServiceInstance } from './service-instance.entity';
import { Route } from './route.entity';
import { BaseEntity } from './base.entity';

export const ServiceProtocol = {
  HTTP: 'http',
  HTTPS: 'https',
  GRPC: 'grpc',
} as const;

export type ServiceProtocol = (typeof ServiceProtocol)[keyof typeof ServiceProtocol];

@Entity('services')
export class Service extends BaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 10, default: ServiceProtocol.HTTP })
  protocol: ServiceProtocol;

  @OneToMany(() => ServiceInstance, (instance) => instance.service)
  instances: ServiceInstance[];

  @OneToMany(() => Route, (route) => route.service)
  routes: Route[];
}
