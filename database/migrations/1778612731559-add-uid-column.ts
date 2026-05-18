import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUidColumn1778612731559 implements MigrationInterface {
    name = 'AddUidColumn1778612731559'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "service_instances" ADD "uid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "service_instances" ADD CONSTRAINT "UQ_0e3888f70e72a2c970f5d072ddc" UNIQUE ("uid")`);
        await queryRunner.query(`ALTER TABLE "service_instances" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "routes" ADD "uid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "routes" ADD CONSTRAINT "UQ_a1831228dea738f2bd869d15fe8" UNIQUE ("uid")`);
        await queryRunner.query(`ALTER TABLE "routes" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "services" ADD "uid" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "UQ_7ebb796ba1fc0fa48b39f34a27c" UNIQUE ("uid")`);
        await queryRunner.query(`ALTER TABLE "services" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "service_instances" DROP CONSTRAINT "FK_e28ef7a9274a2dff889c8db912e"`);
        await queryRunner.query(`ALTER TABLE "service_instances" DROP CONSTRAINT "PK_e953014223dbd76e755016bb507"`);
        await queryRunner.query(`ALTER TABLE "service_instances" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "service_instances" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "service_instances" ADD CONSTRAINT "PK_e953014223dbd76e755016bb507" PRIMARY KEY ("id")`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e28ef7a9274a2dff889c8db912"`);
        await queryRunner.query(`ALTER TABLE "service_instances" DROP COLUMN "service_id"`);
        await queryRunner.query(`ALTER TABLE "service_instances" ADD "service_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "routes" DROP CONSTRAINT "FK_ff0fd330aa2cce3b361208322d7"`);
        await queryRunner.query(`ALTER TABLE "routes" DROP CONSTRAINT "PK_76100511cdfa1d013c859f01d8b"`);
        await queryRunner.query(`ALTER TABLE "routes" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "routes" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "routes" ADD CONSTRAINT "PK_76100511cdfa1d013c859f01d8b" PRIMARY KEY ("id")`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ff0fd330aa2cce3b361208322d"`);
        await queryRunner.query(`ALTER TABLE "routes" DROP COLUMN "service_id"`);
        await queryRunner.query(`ALTER TABLE "routes" ADD "service_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "services" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id")`);
        await queryRunner.query(`CREATE INDEX "IDX_e28ef7a9274a2dff889c8db912" ON "service_instances" ("service_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_ff0fd330aa2cce3b361208322d" ON "routes" ("service_id") `);
        await queryRunner.query(`ALTER TABLE "service_instances" ADD CONSTRAINT "FK_e28ef7a9274a2dff889c8db912e" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "routes" ADD CONSTRAINT "FK_ff0fd330aa2cce3b361208322d7" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "routes" DROP CONSTRAINT "FK_ff0fd330aa2cce3b361208322d7"`);
        await queryRunner.query(`ALTER TABLE "service_instances" DROP CONSTRAINT "FK_e28ef7a9274a2dff889c8db912e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ff0fd330aa2cce3b361208322d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e28ef7a9274a2dff889c8db912"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "services" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "services" ADD CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "routes" DROP COLUMN "service_id"`);
        await queryRunner.query(`ALTER TABLE "routes" ADD "service_id" uuid NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_ff0fd330aa2cce3b361208322d" ON "routes" ("service_id") `);
        await queryRunner.query(`ALTER TABLE "routes" DROP CONSTRAINT "PK_76100511cdfa1d013c859f01d8b"`);
        await queryRunner.query(`ALTER TABLE "routes" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "routes" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "routes" ADD CONSTRAINT "PK_76100511cdfa1d013c859f01d8b" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "routes" ADD CONSTRAINT "FK_ff0fd330aa2cce3b361208322d7" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "service_instances" DROP COLUMN "service_id"`);
        await queryRunner.query(`ALTER TABLE "service_instances" ADD "service_id" uuid NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_e28ef7a9274a2dff889c8db912" ON "service_instances" ("service_id") `);
        await queryRunner.query(`ALTER TABLE "service_instances" DROP CONSTRAINT "PK_e953014223dbd76e755016bb507"`);
        await queryRunner.query(`ALTER TABLE "service_instances" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "service_instances" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "service_instances" ADD CONSTRAINT "PK_e953014223dbd76e755016bb507" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "service_instances" ADD CONSTRAINT "FK_e28ef7a9274a2dff889c8db912e" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "services" DROP CONSTRAINT "UQ_7ebb796ba1fc0fa48b39f34a27c"`);
        await queryRunner.query(`ALTER TABLE "services" DROP COLUMN "uid"`);
        await queryRunner.query(`ALTER TABLE "routes" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "routes" DROP CONSTRAINT "UQ_a1831228dea738f2bd869d15fe8"`);
        await queryRunner.query(`ALTER TABLE "routes" DROP COLUMN "uid"`);
        await queryRunner.query(`ALTER TABLE "service_instances" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "service_instances" DROP CONSTRAINT "UQ_0e3888f70e72a2c970f5d072ddc"`);
        await queryRunner.query(`ALTER TABLE "service_instances" DROP COLUMN "uid"`);
    }

}
