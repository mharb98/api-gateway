import { DataSource } from 'typeorm';
import { Route, HttpMethod } from '../../src/data-access/entities/route.entity';

export async function seedRoutes(
  dataSource: DataSource,
  serviceMap: Map<string, string>,
): Promise<void> {
  const repo = dataSource.getRepository(Route);
  const userId = serviceMap.get('user-service')!;
  const orderId = serviceMap.get('order-service')!;
  const notifId = serviceMap.get('notification-service')!;

  await repo.save([
    // user-service — static and param routes
    repo.create({ serviceId: userId, method: HttpMethod.GET,    pathPattern: '/users',     stripPrefix: false, priority: 10, isEnabled: true }),
    repo.create({ serviceId: userId, method: HttpMethod.POST,   pathPattern: '/users',     stripPrefix: false, priority: 10, isEnabled: true }),
    repo.create({ serviceId: userId, method: HttpMethod.GET,    pathPattern: '/users/:id', stripPrefix: false, priority: 5,  isEnabled: true }),
    repo.create({ serviceId: userId, method: HttpMethod.PUT,    pathPattern: '/users/:id', stripPrefix: false, priority: 5,  isEnabled: true }),
    repo.create({ serviceId: userId, method: HttpMethod.DELETE, pathPattern: '/users/:id', stripPrefix: false, priority: 5,  isEnabled: true }),

    // order-service — static and param routes
    repo.create({ serviceId: orderId, method: HttpMethod.GET,  pathPattern: '/orders',     stripPrefix: false, priority: 10, isEnabled: true }),
    repo.create({ serviceId: orderId, method: HttpMethod.POST, pathPattern: '/orders',     stripPrefix: false, priority: 10, isEnabled: true }),
    repo.create({ serviceId: orderId, method: HttpMethod.GET,  pathPattern: '/orders/:id', stripPrefix: false, priority: 5,  isEnabled: true }),

    // notification-service — wildcard catch-all with stripPrefix (method-agnostic)
    repo.create({ serviceId: notifId, method: null, pathPattern: '/notifications/*', stripPrefix: true,  priority: 1, isEnabled: true }),

    // disabled legacy route — exercises isEnabled filtering in RouteLoaderService
    repo.create({ serviceId: userId,  method: null, pathPattern: '/api/v1/*',        stripPrefix: true,  priority: 0, isEnabled: false }),
  ]);
}
