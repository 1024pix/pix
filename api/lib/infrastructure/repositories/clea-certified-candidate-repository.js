const { knex } = require('../../../db/knex-database-connection.js');
const { CLEA } = require('../../domain/models/ComplementaryCertification.js');
const CleaCertifiedCandidate = require('../../domain/read-models/CleaCertifiedCandidate.js');

module.exports = {
  async getBySessionId(sessionId) {
    const results = await knex
      .from('certification-courses')
      .select(
        'certification-courses.firstName',
        'certification-courses.lastName',
        'certification-candidates.resultRecipientEmail',
        'certification-courses.birthdate',
        'certification-courses.birthplace',
        'certification-courses.birthPostalCode',
        'certification-courses.birthINSEECode',
        'certification-courses.birthCountry',
        'certification-courses.sex',
        'certification-courses.createdAt'
      )
      .innerJoin('certification-candidates', function () {
        this.on({ 'certification-candidates.sessionId': 'certification-courses.sessionId' }).andOn({
          'certification-candidates.userId': 'certification-courses.userId',
        });
      })
      .innerJoin(
        'complementary-certification-courses',
        'complementary-certification-courses.certificationCourseId',
        'certification-courses.id'
      )
      .innerJoin(
        'complementary-certifications',
        'complementary-certifications.id',
        'complementary-certification-courses.complementaryCertificationId'
      )
      .innerJoin(
        'complementary-certification-course-results',
        'complementary-certification-course-results.complementaryCertificationCourseId',
        'complementary-certification-courses.id'
      )
      .where({
        'certification-courses.sessionId': sessionId,
        'certification-courses.isPublished': true,
        'complementary-certifications.key': CLEA,
        'complementary-certification-course-results.acquired': true,
      });
    return results.map((candidate) => new CleaCertifiedCandidate(candidate));
  },
};
