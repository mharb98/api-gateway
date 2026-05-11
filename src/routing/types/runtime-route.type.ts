import type { HttpMethod } from '../../data-access/entities/route.entity';
import type { ServiceProtocol } from '../../data-access/entities/service.entity';

export interface RuntimeInstance {
  uid: string;
  host: string;
  port: number;
  weight: number;
}

export interface RuntimeRoute {
  uid: string;
  serviceId: string;
  serviceName: string;
  serviceProtocol: ServiceProtocol;
  host: string | null;
  pathPattern: string;
  method: HttpMethod | null;
  stripPrefix: boolean;
  priority: number;
  instances: RuntimeInstance[];
}
