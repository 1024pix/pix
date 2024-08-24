const TABLE_NAME = 'user-certificabilities';

const up = async function (knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.increments('id').primary();
    table.bigInteger('userId').references('users.id').notNullable().unique();
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
    table.jsonb('certificability').notNullable();
    table.jsonb('certificabilityV2').notNullable();
    table.dateTime('latestKnowledgeElementCreatedAt');
    table.dateTime('latestCertificationDeliveredAt');
    table.dateTime('latestBadgeAcquisitionUpdatedAt');
    table.dateTime('latestComplementaryCertificationBadgeDetachedAt');
  });
};

const down = async function (knex) {
  return knex.schema.dropTable(TABLE_NAME);
};

export { down, up };
