import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

const entities = [
  // Register entities here as they are created, e.g.:
  // User,
];

@Module({
  imports: [TypeOrmModule.forFeature(entities)],
  exports: [TypeOrmModule],
})
export class DataAccessModule {}
