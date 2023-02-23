const { knex } = require('../../../db/knex-database-connection.js');

module.exports = {
  async getComplementaryCertificationCourseId({ certificationCourseId, complementaryCertificationKey }) {
    const result = await knex
      .from('complementary-certification-courses')
      .select('complementary-certification-courses.id')
      .innerJoin(
        'complementary-certifications',
        'complementary-certifications.id',
        'complementary-certification-courses.complementaryCertificationId'
      )
      .where({ certificationCourseId, key: complementaryCertificationKey })
      .first();

    return result?.id;
  },
};
