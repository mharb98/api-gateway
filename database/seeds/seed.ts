import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/configs/typeorm.config';
import { seedServices } from './01-services.seed';
import { seedServiceInstances } from './02-service-instances.seed';
import { seedRoutes } from './03-routes.seed';

async function clearDatabase(dataSource: DataSource): Promise<void> {
  await dataSource.query(
    'TRUNCATE TABLE routes, service_instances, services RESTART IDENTITY CASCADE',
  );
}

async function main(): Promise<void> {
  const shouldReset = process.argv.includes('--reset');

  console.log('Connecting to database...');
  await AppDataSource.initialize();

  try {
    if (shouldReset) {
      console.log('Clearing all tables...');
      await clearDatabase(AppDataSource);
      console.log('Tables cleared.');
    }

    console.log('Seeding services...');
    const serviceMap = await seedServices(AppDataSource);
    console.log(`  ✓ ${serviceMap.size} services`);

    console.log('Seeding service instances...');
    await seedServiceInstances(AppDataSource, serviceMap);
    console.log('  ✓ 5 instances (1 intentionally unhealthy)');

    console.log('Seeding routes...');
    await seedRoutes(AppDataSource, serviceMap);
    console.log('  ✓ 10 routes (1 disabled)');

    console.log('\nSeeding complete.');
  } finally {
    await AppDataSource.destroy();
  }
}

main().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
