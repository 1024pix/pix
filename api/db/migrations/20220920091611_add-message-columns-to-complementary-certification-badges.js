import bluebird from 'bluebird';

const TABLE_NAME = 'complementary-certification-badges';
const MESSAGE_COLUMN_NAME = 'certificateMessage';
const TEMP_MESSAGE_COLUMN_NAME = 'temporaryCertificateMessage';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, function (table) {
    table.string(MESSAGE_COLUMN_NAME).nullable();
    table.string(TEMP_MESSAGE_COLUMN_NAME).nullable();
  });

  const complementaryCertificationIds = await knex('complementary-certifications')
    .whereIn('key', ['EDU_1ER_DEGRE', 'EDU_2ND_DEGRE'])
    .pluck('id');

  const eduBadges = await knex('complementary-certification-badges').whereIn(
    'complementaryCertificationId',
    complementaryCertificationIds
  );

  await bluebird.mapSeries(eduBadges, async ({ id, label }) => {
    await knex(TABLE_NAME)
      .where({ id })
      .update({
        [MESSAGE_COLUMN_NAME]: `Vous avez obtenu la certification ${label}`,
        [TEMP_MESSAGE_COLUMN_NAME]: `Vous avez obtenu le niveau “${label}” dans le cadre du volet 1 de la certification Pix+Édu. Votre niveau final sera déterminé à l’issue du volet 2`,
      });
  });
};

export const down = function (knex) {
  return knex.schema.table(TABLE_NAME, function (table) {
    table.dropColumn(MESSAGE_COLUMN_NAME);
    table.dropColumn(TEMP_MESSAGE_COLUMN_NAME);
  });
};
