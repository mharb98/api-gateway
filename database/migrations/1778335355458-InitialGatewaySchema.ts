import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialGatewaySchema1778335355458 implements MigrationInterface {
    name = 'InitialGatewaySchema1778335355458'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "service_instances" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "service_id" uuid NOT NULL, "host" character varying(255) NOT NULL, "port" integer NOT NULL, "weight" integer NOT NULL DEFAULT '1', "is_healthy" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e953014223dbd76e755016bb507" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e28ef7a9274a2dff889c8db912" ON "service_instances" ("service_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_211805ad2396ebb04b4b579f2e" ON "service_instances" ("is_healthy") `);
        await queryRunner.query(`CREATE TYPE "public"."routes_method_enum" AS ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD')`);
        await queryRunner.query(`CREATE TABLE "routes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "service_id" uuid NOT NULL, "host" character varying(255), "path_pattern" character varying(255) NOT NULL, "method" "public"."routes_method_enum", "strip_prefix" boolean NOT NULL DEFAULT false, "priority" integer NOT NULL DEFAULT '0', "is_enabled" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_76100511cdfa1d013c859f01d8b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ff0fd330aa2cce3b361208322d" ON "routes" ("service_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_6a26316f921f4055647a781b1c" ON "routes" ("host") `);
        await queryRunner.query(`CREATE INDEX "IDX_26c7510e711f3e3dc58ed56f29" ON "routes" ("path_pattern") `);
        await queryRunner.query(`CREATE INDEX "IDX_12a90b69c95aa3bfc32b04626b" ON "routes" ("method") `);
        await queryRunner.query(`CREATE INDEX "IDX_af80e3e22c8d69b00614b2be31" ON "routes" ("priority") `);
        await queryRunner.query(`CREATE TABLE "services" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "protocol" character varying(10) NOT NULL DEFAULT 'http', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_019d74f7abcdcb5a0113010cb03" UNIQUE ("name"), CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "service_instances" ADD CONSTRAINT "FK_e28ef7a9274a2dff889c8db912e" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "routes" ADD CONSTRAINT "FK_ff0fd330aa2cce3b361208322d7" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "routes" DROP CONSTRAINT "FK_ff0fd330aa2cce3b361208322d7"`);
        await queryRunner.query(`ALTER TABLE "service_instances" DROP CONSTRAINT "FK_e28ef7a9274a2dff889c8db912e"`);
        await queryRunner.query(`DROP TABLE "services"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_af80e3e22c8d69b00614b2be31"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_12a90b69c95aa3bfc32b04626b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_26c7510e711f3e3dc58ed56f29"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6a26316f921f4055647a781b1c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ff0fd330aa2cce3b361208322d"`);
        await queryRunner.query(`DROP TABLE "routes"`);
        await queryRunner.query(`DROP TYPE "public"."routes_method_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_211805ad2396ebb04b4b579f2e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e28ef7a9274a2dff889c8db912"`);
        await queryRunner.query(`DROP TABLE "service_instances"`);
    }

}
