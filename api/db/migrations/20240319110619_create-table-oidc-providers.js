const TABLE_NAME = 'oidc-providers';

export function up(knex) {
  return knex.schema.createTable(TABLE_NAME, (table) => {
    table.increments('id').primary();
    table.string('accessTokenLifespan').notNullable();
    table.string('claimsToStore ');
    table.string('clientId').notNullable();
    table.dateTime('createdAt').notNullable().defaultTo(knex.fn.now());
    table.jsonb('customProperties');
    table.boolean('enabled').notNullable().defaultTo(false);
    table.string('encryptedClientSecret').notNullable();
    table.jsonb('extraAuthorizationUrlParameters');
    table.string('identityProvider').notNullable();
    table.string('idTokenLifespan').notNullable();
    table.binary('logo');
    table.jsonb('openidClientExtraMetadata');
    table.string('openidConfigurationUrl').notNullable();
    table.string('organizationName').notNullable();
    table.string('postLogoutRedirectUri');
    table.string('redirectUri').notNullable();
    table.string('scope').notNullable();
    table.string('slug').notNullable();
    table.string('source').notNullable();
    table.dateTime('updatedAt').notNullable().defaultTo(knex.fn.now());
  });
}

export function down(knex) {
  return knex.schema.dropTable(TABLE_NAME);
}
