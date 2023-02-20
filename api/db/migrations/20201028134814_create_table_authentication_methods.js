const TABLE_NAME = 'authentication-methods';

export const up = async (knex) => {
  await knex.schema.createTable(TABLE_NAME, (t) => {
    t.increments('id').primary();
    t.integer('userId').references('users.id').index();
    t.string('identityProvider').notNullable();
    t.jsonb('authenticationComplement');
    t.string('externalIdentifier');
    t.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    t.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());

    t.unique(['identityProvider', 'externalIdentifier']);
    t.unique(['identityProvider', 'userId']);
  });

  return knex.raw(
    'ALTER TABLE "authentication-methods" ADD CONSTRAINT "authentication_methods_identityProvider_check" CHECK ( "identityProvider" IN (\'PIX\', \'GAR\', \'POLE_EMPLOI\') )'
  );
};

export const down = (knex) => {
  return knex.schema.dropTable(TABLE_NAME);
};
