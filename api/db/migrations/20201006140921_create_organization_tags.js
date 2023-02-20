const TAGS_TABLE_NAME = 'tags';
const ORGANIZATION_TAGS_TABLE_NAME = 'organization-tags';

export const up = async (knex) => {
  await knex.schema.createTable(TAGS_TABLE_NAME, (t) => {
    t.increments().primary();
    t.string('name').notNullable().unique();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  });

  return knex.schema.createTable(ORGANIZATION_TAGS_TABLE_NAME, (t) => {
    t.increments().primary();
    t.integer('organizationId').unsigned().references('organizations.id').index();
    t.integer('tagId').unsigned().references('tags.id').index();
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
    t.unique(['organizationId', 'tagId']);
  });
};

export const down = async (knex) => {
  await knex.schema.dropTable(ORGANIZATION_TAGS_TABLE_NAME);
  return knex.schema.dropTable(TAGS_TABLE_NAME);
};
