const TABLE_NAME = 'organization-imports';

const up = async function (knex) {
  await knex.schema.raw(`CREATE TYPE "organization-imports-statuses" AS ENUM ( 'UPLOADED',
	'VALIDATED',
	'IMPORTED',
	'VALIDATION_ERROR',
	'IMPORT_ERROR'
);`);

  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.increments('id').primary().notNullable();
    table.specificType('status', '"organization-imports-statuses"');
    table.text('filename').notNullable();
    table.text('encoding').nullable();
    table.jsonb('errors').nullable();
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.bigInteger('createdBy').notNullable().index().references('users.id');
    table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
    table.integer('organizationId').notNullable().unsigned().references('organizations.id').index();
  });
};

const down = async function (knex) {
  await knex.schema.dropTable(TABLE_NAME);
  await knex.schema.raw(`DROP TYPE "organization-imports-statuses"`);
};

export { down, up };
