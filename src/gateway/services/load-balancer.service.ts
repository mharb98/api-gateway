import { Injectable } from '@nestjs/common';
import type { RuntimeInstance, RuntimeRoute } from '../../routing/types/runtime-route.type.js';

@Injectable()
export class LoadBalancerService {
  private readonly counters = new Map<string, number>();

  pick(route: RuntimeRoute): RuntimeInstance | null {
    const { instances, serviceId } = route;
    if (instances.length === 0) return null;

    const current = this.counters.get(serviceId) ?? 0;
    const index = current % instances.length;
    this.counters.set(serviceId, current + 1);

    return instances[index];
  }
}
