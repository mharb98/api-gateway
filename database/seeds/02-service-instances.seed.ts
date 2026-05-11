import { DataSource } from 'typeorm';
import { ServiceInstance } from '../../src/data-access/entities/service-instance.entity';

export async function seedServiceInstances(
  dataSource: DataSource,
  serviceMap: Map<string, string>,
): Promise<void> {
  const repo = dataSource.getRepository(ServiceInstance);

  await repo.save([
    repo.create({ serviceId: serviceMap.get('user-service')!, host: 'localhost', port: 3001, weight: 2, isHealthy: true }),
    repo.create({ serviceId: serviceMap.get('user-service')!, host: 'localhost', port: 3002, weight: 1, isHealthy: true }),
    repo.create({ serviceId: serviceMap.get('order-service')!, host: 'localhost', port: 3003, weight: 1, isHealthy: true }),
    repo.create({ serviceId: serviceMap.get('order-service')!, host: 'localhost', port: 3004, weight: 1, isHealthy: false }),
    repo.create({ serviceId: serviceMap.get('notification-service')!, host: 'localhost', port: 3005, weight: 1, isHealthy: true }),
  ]);
}
