const { knex } = require('../bookshelf');

module.exports = {
  async getComplementaryCertificationCourseId({ certificationCourseId, complementaryCertificationName }) {
    const result = await knex
      .from('complementary-certification-courses')
      .select('complementary-certification-courses.id')
      .innerJoin(
        'complementary-certifications',
        'complementary-certifications.id',
        'complementary-certification-courses.complementaryCertificationId'
      )
      .where({ certificationCourseId, name: complementaryCertificationName })
      .first();

    return result?.id;
  },
};
