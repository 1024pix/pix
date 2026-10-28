const TABLE_NAME = 'certificates';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.integer('id').primary();
    table
      .integer('version')
      .comment(
        '1, 2 or 3. Useful for appropriate rendering (apps, pdf, csv, etc...) and correct interpretation of results JSON',
      );
    table.integer('userId').notNullable().references('users.id');
    table.string('firstName');
    table.string('middleName');
    table.string('thirdName');
    table.string('lastName');
    table.string('externalId').comment('External IDs that means something to some prescribers, such as INE for SCO');
    table.date('birthdate');
    table.string('birthplace');
    table.string('verificationCode');
    table.string('certificationCenter');
    table.datetime('takenAt');
    table.datetime('deliveredAt');
    table.string('status').comment('Corresponding assessment result status');
    // table.integer('reachedMeshIndex').comment('Useful for V3 certification'); // todo move me in results
    // table.integer('pixScore'); // todo move me in results
    // table.integer('maxReachableLevel').comment('Max reachable level at the time of exam (6, 7 or 8)'); // todo move me in results
    table
      .integer('versionId')
      .references('certification_versions.id')
      .comment('Certification version in which certificate was taken. For V3 only');
    table.string('framework').comment('What certification was taken : CORE / CLEA / PIX+ EDU ...etc');
    table
      .integer('franceCompetencesMinScore')
      .comment(
        'Minimum score to reach for the certificate to be recognized by France Compétences. If null, then it means the certificate is not recognized',
      );
    table
      .jsonb('results')
      .comment(
        'Shape of results changes according to certification Version (1, 2 or 3). The code will handle the parsing',
      );
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable(TABLE_NAME);
}
