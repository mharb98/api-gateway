import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AppLogger, LogSeverity } from '../../common/logger';
import { RoutesRepository } from '../../data-access/repositories/routes.repository';
import type { RuntimeRoute } from '../types/runtime-route.type';
import { MethodRouterService } from './method-router.service';

@Injectable()
export class RouteLoaderService implements OnApplicationBootstrap {
  constructor(
    private readonly routesRepository: RoutesRepository,
    private readonly methodRouterService: MethodRouterService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.load();
  }

  async reload(): Promise<void> {
    this.methodRouterService.clear();
    await this.load();
  }

  private async load(): Promise<void> {
    const routes = await this.routesRepository.findEnabledWithActiveInstances();
    let loaded = 0;
    let skipped = 0;

    for (const route of routes) {
      const instances = route.service.instances;

      if (instances.length === 0) {
        AppLogger.error({
          title: 'RouteLoader',
          severity: LogSeverity.LOW,
          exception: `Route "${route.pathPattern}" (uid: ${route.uid}) skipped — no healthy instances for service "${route.service.name}"`,
        });
        skipped++;
        continue;
      }

      const runtimeRoute: RuntimeRoute = {
        uid: route.uid,
        serviceId: route.service.uid,
        serviceName: route.service.name,
        serviceProtocol: route.service.protocol,
        host: route.host,
        pathPattern: route.pathPattern,
        method: route.method,
        stripPrefix: route.stripPrefix,
        priority: route.priority,
        instances: instances.map((inst) => ({
          uid: inst.uid,
          host: inst.host,
          port: inst.port,
          weight: inst.weight,
        })),
      };

      this.methodRouterService.insert(runtimeRoute);
      loaded++;
    }

    AppLogger.info({
      title: 'RouteLoader',
      message: `Routing table loaded — ${loaded} routes inserted, ${skipped} skipped (no healthy instances)`,
    });
  }
}
