const { expect, databaseBuilder, catchErr, knex } = require('../../../test-helper');
const certificationRepository = require('../../../../lib/infrastructure/repositories/certification-repository');
const { CertificationCourseNotPublishableError } = require('../../../../lib/domain/errors');
const CertificationCourseBookshelf = require('../../../../lib/infrastructure/orm-models/CertificationCourse');
const PARTNER_CLEA_KEY = 'BANANA';

describe('Integration | Repository | Certification ', function () {
  let sessionLatestAssessmentRejected;
  let sessionWithPublishedCertificationCourses;
  let sessionWithStartedAndError;
  let sessionLatestAssessmentRejectedCertifCourseIds;
  let sessionWithStartedAndErrorCertifCourseIds;
  let sessionWithPublishedCertificationCoursesCertifCourseIds;

  let certificationCenterId;
  let certificationCenter;

  beforeEach(async function () {
    databaseBuilder.factory.buildBadge({ key: PARTNER_CLEA_KEY });
    ({ id: certificationCenterId, name: certificationCenter } = databaseBuilder.factory.buildCertificationCenter({
      name: 'Certif College',
    }));

    sessionLatestAssessmentRejectedCertifCourseIds = [];
    sessionWithStartedAndErrorCertifCourseIds = [];
    sessionWithPublishedCertificationCoursesCertifCourseIds = [];

    sessionLatestAssessmentRejected = databaseBuilder.factory.buildSession();
    let id = createCertifCourseWithAssessementResults(
      sessionLatestAssessmentRejected.id,
      { status: 'started', createdAt: new Date('2018-02-15T15:00:34Z') },
      { status: 'rejected', createdAt: new Date('2018-02-16T15:00:34Z') }
    );
    sessionLatestAssessmentRejectedCertifCourseIds.push(id);

    sessionWithStartedAndError = databaseBuilder.factory.buildSession();
    id = createCertifCourseWithAssessementResults(sessionWithStartedAndError.id, { status: 'started' });
    sessionWithStartedAndErrorCertifCourseIds.push(id);
    id = createCertifCourseWithAssessementResults(sessionWithStartedAndError.id, { status: 'error' });
    sessionWithStartedAndErrorCertifCourseIds.push(id);

    sessionWithPublishedCertificationCourses = databaseBuilder.factory.buildSession();
    id = createPublishedCertifCourseWithAssessementResults(
      sessionWithPublishedCertificationCourses.id,
      { status: 'started', createdAt: new Date('2018-02-15T15:00:34Z') },
      { status: 'rejected', createdAt: new Date('2018-02-16T15:00:34Z') }
    );
    sessionWithPublishedCertificationCoursesCertifCourseIds.push(id);

    await databaseBuilder.commit();
  });

  afterEach(async function () {
    await knex('complementary-certification-course-results').delete();
    await knex('assessment-results').delete();
    await knex('assessments').delete();
    await knex('certification-courses').delete();
    return knex('sessions').delete();
  });

  describe('#publishCertificationCoursesBySessionId', function () {
    it('should flag the specified certifications as published', async function () {
      await certificationRepository.publishCertificationCoursesBySessionId(sessionLatestAssessmentRejected.id);
      await Promise.all(
        sessionLatestAssessmentRejectedCertifCourseIds.map(async (id) => {
          const certifCourse = await get(id);
          expect(certifCourse.isPublished).to.be.true;
        })
      );
    });

    it('should not flag the specified certifications as published and be rejected', async function () {
      const result = await catchErr(
        certificationRepository.publishCertificationCoursesBySessionId.bind(certificationRepository)
      )(sessionWithStartedAndError.id);
      // then
      expect(result).to.be.instanceOf(CertificationCourseNotPublishableError);

      await Promise.all(
        sessionWithStartedAndErrorCertifCourseIds.map(async (id) => expect((await get(id)).isPublished).to.be.false)
      );
    });

    it('does nothing when there are no certification courses', async function () {
      // given
      const sessionWithNoCertificationCourses = databaseBuilder.factory.buildSession({
        certificationCenterId,
        certificationCenter,
        finalizedAt: new Date('2020-01-01'),
      });
      await databaseBuilder.commit();

      // when
      const publicationPromise = certificationRepository.publishCertificationCoursesBySessionId(
        sessionWithNoCertificationCourses.id
      );

      // then
      await expect(publicationPromise).not.to.be.rejected;
    });
  });

  describe('#unpublishCertificationCoursesBySessionId', function () {
    it('should update the specified certifications', async function () {
      await certificationRepository.unpublishCertificationCoursesBySessionId(
        sessionWithPublishedCertificationCourses.id
      );
      await Promise.all(
        sessionWithPublishedCertificationCoursesCertifCourseIds.map(async (id) => {
          const certifCourse = await get(id);
          expect(certifCourse.isPublished).to.be.false;
        })
      );
    });
  });

  function createPublishedCertifCourseWithAssessementResults(sessionId, ...assessmentResults) {
    const { id: certifCourseId } = databaseBuilder.factory.buildCertificationCourse({ sessionId, isPublished: true });
    const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
      certificationCourseId: certifCourseId,
    });
    assessmentResults.forEach(({ status, createdAt }) =>
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessmentId,
        createdAt,
        status,
      })
    );

    return certifCourseId;
  }

  function createCertifCourseWithAssessementResults(sessionId, ...assessmentResults) {
    const { id: certifCourseId } = databaseBuilder.factory.buildCertificationCourse({ sessionId, isPublished: false });
    const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
      certificationCourseId: certifCourseId,
    });
    assessmentResults.forEach(({ status, createdAt }) =>
      databaseBuilder.factory.buildAssessmentResult({
        assessmentId: assessmentId,
        createdAt,
        status,
      })
    );

    return certifCourseId;
  }

  async function get(id) {
    const certification = await CertificationCourseBookshelf.where({ id }).fetch();
    return certification.attributes;
  }
});
