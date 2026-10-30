const TABLE_NAME = 'certificates';

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable(TABLE_NAME, function (table) {
    table.integer('id').primary();
    table
      .integer('algorithmEngineVersion')
      .comment(
        '1, 2 or 3. Useful for appropriate rendering (apps, pdf, csv, etc...) and correct interpretation of results JSON',
      );
    table.integer('userId');
    table.string('firstName');
    table.string('middleName');
    table.string('thirdName');
    table.string('lastName');
    table.string('externalId').comment('External IDs that means something to some prescribers, such as INE for SCO');
    table.date('birthdate');
    table.string('birthplace');
    table.string('verificationCode');
    table.string('certificationCenter');
    table.datetime('startedAt');
    table.datetime('deliveredAt');
    table.string('status').comment('Corresponding assessment result status');
    table.integer('versionId').comment('Certification version in which certificate was taken. For V3 only');
    table.string('framework').comment('What certification was taken : CORE / CLEA / PIX+ EDU ...etc');
    table
      .integer('franceCompetencesMinScore')
      .comment(
        'Minimum score to reach for the certificate to be recognized by France Compétences. If null, then it means the certificate is not recognized',
      );
    table.string('commentByAutoJury');
    table.string('commentByJury');
    table.string('commentForOrganization');
    table.string('commentForCandidate');
    table
      .jsonb('results')
      .comment(
        'Shape of results changes according to certification AlgorithmEngineVersion (1, 2 or 3). The code will handle the parsing',
      );
    // TODO manque les commentaires (jury candidate et orga)
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable(TABLE_NAME);
}
