import { type Knex } from 'knex';

const TABLE_NAME = 'audit-log';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.bigIncrements().primary();
    table.dateTime('occurredAt').notNullable();
    table.string('action').notNullable().checkIn(['ANONYMIZATION']);
    table.bigInteger('userId').notNullable();
    table.bigInteger('targetUserId').notNullable();
    table.string('client').notNullable().checkIn(['PIX_ADMIN']);
    table.string('role').notNullable().checkIn(['SUPER_ADMIN', 'SUPPORT']);
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable(TABLE_NAME);
}
