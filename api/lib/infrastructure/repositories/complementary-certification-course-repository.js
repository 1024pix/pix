const { knex } = require('../bookshelf');

module.exports = {
  async hasComplementaryCertification({ certificationCourseId, complementaryCertificationName }) {
    const result = await knex
      .from('complementary-certification-courses')
      .select(1)
      .innerJoin(
        'complementary-certifications',
        'complementary-certifications.id',
        'complementary-certification-courses.complementaryCertificationId'
      )
      .where({ certificationCourseId, name: complementaryCertificationName })
      .first();

    return Boolean(result);
  },
};
