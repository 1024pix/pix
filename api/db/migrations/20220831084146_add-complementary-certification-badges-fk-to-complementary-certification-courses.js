import bluebird from 'bluebird';
const TABLE_NAME = 'complementary-certification-courses';
const COLUMN = 'complementaryCertificationBadgeId';

export const up = async function (knex) {
  await knex.schema.table(TABLE_NAME, async (table) => {
    await table.integer(COLUMN).references('complementary-certification-badges.id');
  });
  const complementaryCertificationBadges = await knex('complementary-certification-badges')
    .select('complementary-certification-badges.id', 'badges.key')
    .join('badges', 'badges.id', 'complementary-certification-badges.badgeId');

  const complementaryCertificationCourses = await knex('complementary-certification-courses')
    .join(
      'complementary-certification-course-results',
      'complementary-certification-course-results.complementaryCertificationCourseId',
      'complementary-certification-courses.id'
    )
    .select('complementary-certification-courses.id', 'complementary-certification-course-results.partnerKey');

  await bluebird.mapSeries(complementaryCertificationCourses, async function ({ id, partnerKey }) {
    const complementaryCertificationBadgeId = complementaryCertificationBadges.find(({ key }) => key === partnerKey).id;
    await knex(TABLE_NAME).update(COLUMN, complementaryCertificationBadgeId).where({ id });
  });
};

export const down = async function (knex) {
  await knex.schema.table(TABLE_NAME, async (table) => {
    table.dropColumn(COLUMN);
  });
};
