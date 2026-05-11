import { DataSource } from 'typeorm';
import { Service, ServiceProtocol } from '../../src/data-access/entities/service.entity';

export async function seedServices(dataSource: DataSource): Promise<Map<string, number>> {
  const repo = dataSource.getRepository(Service);

  const services = await repo.save([
    repo.create({ name: 'user-service', protocol: ServiceProtocol.HTTP }),
    repo.create({ name: 'order-service', protocol: ServiceProtocol.HTTP }),
    repo.create({ name: 'notification-service', protocol: ServiceProtocol.HTTP }),
  ]);

  return new Map(services.map((s) => [s.name, s.id]));
}
