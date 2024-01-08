import { knex } from '../../../db/knex-database-connection.js';
import { ComplementaryCertificationKeys } from '../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { CleaCertifiedCandidate } from '../../domain/read-models/CleaCertifiedCandidate.js';

const getBySessionId = async function (sessionId) {
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
      'certification-courses.createdAt',
    )
    .innerJoin('certification-candidates', function () {
      this.on({ 'certification-candidates.sessionId': 'certification-courses.sessionId' }).andOn({
        'certification-candidates.userId': 'certification-courses.userId',
      });
    })
    .innerJoin(
      'complementary-certification-courses',
      'complementary-certification-courses.certificationCourseId',
      'certification-courses.id',
    )
    .innerJoin(
      'complementary-certifications',
      'complementary-certifications.id',
      'complementary-certification-courses.complementaryCertificationId',
    )
    .innerJoin(
      'complementary-certification-course-results',
      'complementary-certification-course-results.complementaryCertificationCourseId',
      'complementary-certification-courses.id',
    )
    .where({
      'certification-courses.sessionId': sessionId,
      'certification-courses.isPublished': true,
      'complementary-certifications.key': ComplementaryCertificationKeys.CLEA,
      'complementary-certification-course-results.acquired': true,
    });
  return results.map((candidate) => new CleaCertifiedCandidate(candidate));
};

export { getBySessionId };
