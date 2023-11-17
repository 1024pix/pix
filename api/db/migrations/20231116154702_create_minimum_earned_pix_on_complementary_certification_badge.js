const COMPLEMENTARY_CERTIFICATION_BADGES = 'complementary-certification-badges';
const COMPLEMENTARY_CERTIFICATIONS = 'complementary-certifications';
const MINIMUM_EARNED_PIX = 'minimumEarnedPix';

const up = async function (knex) {
  await knex.schema.table(COMPLEMENTARY_CERTIFICATION_BADGES, function (table) {
    table.integer(MINIMUM_EARNED_PIX).defaultTo(0);
  });

  const mappings = await knex
    .select(`${COMPLEMENTARY_CERTIFICATIONS}.${MINIMUM_EARNED_PIX}`, `${COMPLEMENTARY_CERTIFICATION_BADGES}.id`)
    .from(COMPLEMENTARY_CERTIFICATION_BADGES)
    .join(
      COMPLEMENTARY_CERTIFICATIONS,
      `${COMPLEMENTARY_CERTIFICATIONS}.id`,
      `${COMPLEMENTARY_CERTIFICATION_BADGES}.complementaryCertificationId`,
    )
    .whereNotNull(`${COMPLEMENTARY_CERTIFICATIONS}.${MINIMUM_EARNED_PIX}`);

  for (const { [MINIMUM_EARNED_PIX]: minimumEarnedPix, id: complementaryCertificationBadgeId } of mappings) {
    await knex(COMPLEMENTARY_CERTIFICATION_BADGES)
      .update({ minimumEarnedPix })
      .where(`${COMPLEMENTARY_CERTIFICATION_BADGES}.id`, complementaryCertificationBadgeId);
  }
};

const down = async function (knex) {
  await knex.schema.table(COMPLEMENTARY_CERTIFICATION_BADGES, function (table) {
    table.dropColumn(MINIMUM_EARNED_PIX);
  });
};

export { up, down };
