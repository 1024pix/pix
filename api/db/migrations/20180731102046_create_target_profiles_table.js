const TABLE_NAME_TARGET_PROFILES = 'target-profiles';
const TABLE_NAME_TARGET_PROFILES_SKILLS = 'target-profiles_skills';
const TABLE_NAME_CAMPAIGNS = 'campaigns';

export const up = function (knex) {
  return knex.schema
    .createTable(TABLE_NAME_TARGET_PROFILES, (t) => {
      t.increments().primary();
      t.string('name').notNullable();
      t.boolean('isPublic').notNullable().defaultTo(false);
      t.integer('organizationId').unsigned().references('organizations.id').index();
      t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    })
    .then(() => {
      return knex.schema.createTable(TABLE_NAME_TARGET_PROFILES_SKILLS, (t) => {
        t.increments().primary();
        t.integer('targetProfileId').unsigned().references('target-profiles.id').index();
        t.string('skillId').notNullable();
      });
    })
    .then(() => {
      return knex.schema.table(TABLE_NAME_CAMPAIGNS, function (table) {
        table.integer('targetProfileId').references('target-profiles.id').index();
      });
    });
};

export const down = function (knex) {
  return knex.schema
    .table(TABLE_NAME_CAMPAIGNS, function (table) {
      table.dropColumn('targetProfileId');
    })
    .then(() => {
      return knex.schema.dropTable(TABLE_NAME_TARGET_PROFILES_SKILLS);
    })
    .then(() => {
      return knex.schema.dropTable(TABLE_NAME_TARGET_PROFILES);
    });
};
