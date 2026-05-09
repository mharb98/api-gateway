import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ServiceInstance } from './service-instance.entity';
import { Route } from './route.entity';

export const ServiceProtocol = {
  HTTP: 'http',
  HTTPS: 'https',
  GRPC: 'grpc',
} as const;

export type ServiceProtocol = (typeof ServiceProtocol)[keyof typeof ServiceProtocol];

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 10, default: ServiceProtocol.HTTP })
  protocol: ServiceProtocol;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => ServiceInstance, (instance) => instance.service)
  instances: ServiceInstance[];

  @OneToMany(() => Route, (route) => route.service)
  routes: Route[];
}
