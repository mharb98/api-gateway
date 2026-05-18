import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBaseEntityFields1778680955000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Skip if AddUidColumn migration already applied these changes
    const existing = await queryRunner.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'services' AND column_name = 'uid'
    `);
    if (existing.length > 0) return;

    // ── 1. Drop existing FK constraints that reference the old UUID PKs ──────
    const routeFkRows: { constraint_name: string }[] = await queryRunner.query(`
      SELECT constraint_name FROM information_schema.table_constraints
      WHERE table_name = 'routes' AND constraint_type = 'FOREIGN KEY'
    `);
    for (const { constraint_name } of routeFkRows) {
      await queryRunner.query(`ALTER TABLE routes DROP CONSTRAINT IF EXISTS "${constraint_name}"`);
    }

    const instanceFkRows: { constraint_name: string }[] = await queryRunner.query(`
      SELECT constraint_name FROM information_schema.table_constraints
      WHERE table_name = 'service_instances' AND constraint_type = 'FOREIGN KEY'
    `);
    for (const { constraint_name } of instanceFkRows) {
      await queryRunner.query(`ALTER TABLE service_instances DROP CONSTRAINT IF EXISTS "${constraint_name}"`);
    }

    // ── 2. Add uid + updated_at to all tables; copy old UUID PK into uid ─────
    for (const table of ['services', 'service_instances', 'routes']) {
      await queryRunner.query(`
        ALTER TABLE "${table}"
          ADD COLUMN uid        UUID NOT NULL DEFAULT gen_random_uuid(),
          ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      `);
      await queryRunner.query(`UPDATE "${table}" SET uid = id`);
      await queryRunner.query(`ALTER TABLE "${table}" ADD CONSTRAINT "UQ_${table}_uid" UNIQUE (uid)`);
    }

    // ── 3. Replace UUID PK with integer serial on each table ─────────────────
    for (const table of ['services', 'service_instances', 'routes']) {
      await queryRunner.query(`ALTER TABLE "${table}" DROP CONSTRAINT "${table}_pkey"`);
      await queryRunner.query(`ALTER TABLE "${table}" RENAME COLUMN id TO _legacy_pk`);
      await queryRunner.query(`ALTER TABLE "${table}" ADD COLUMN id SERIAL`);
      await queryRunner.query(`ALTER TABLE "${table}" ADD CONSTRAINT "${table}_pkey" PRIMARY KEY (id)`);
      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN _legacy_pk`);
    }

    // ── 4. Replace UUID FK columns with INTEGER FK columns ───────────────────
    for (const table of ['routes', 'service_instances']) {
      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN service_id`);
      await queryRunner.query(`ALTER TABLE "${table}" ADD COLUMN service_id INTEGER NOT NULL DEFAULT 0`);
      await queryRunner.query(`ALTER TABLE "${table}" ALTER COLUMN service_id DROP DEFAULT`);
    }

    await queryRunner.query(`
      ALTER TABLE routes
        ADD CONSTRAINT "FK_routes_service_id"
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE service_instances
        ADD CONSTRAINT "FK_service_instances_service_id"
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
    `);

    // ── 5. Re-add indexes ─────────────────────────────────────────────────────
    await queryRunner.query(`CREATE INDEX "IDX_routes_service_id"            ON routes(service_id)`);
    await queryRunner.query(`CREATE INDEX "IDX_service_instances_service_id" ON service_instances(service_id)`);
    await queryRunner.query(`CREATE INDEX "IDX_services_uid"                 ON services(uid)`);
    await queryRunner.query(`CREATE INDEX "IDX_service_instances_uid"        ON service_instances(uid)`);
    await queryRunner.query(`CREATE INDEX "IDX_routes_uid"                   ON routes(uid)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    throw new Error(
      'Down migration not supported for PK type change. Run db:reset after migration:revert.',
    );
  }
}
