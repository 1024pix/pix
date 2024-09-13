import * as pixCertificationRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/pix-certification-repository.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Enrolment | Integration | Repository | PixCertification', function () {
  describe('#findByUserId', function () {
    context('when a user has no certification', function () {
      it('should return an empty array', async function () {
        // when
        const actualPixCertifications = await pixCertificationRepository.findByUserId({ userId: 99999999 });

        // then
        expect(actualPixCertifications).to.deepEqualArray([]);
      });
    });

    context('when a user has certifications', function () {
      it("should return all published user's certifications", async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const firstPublishedSessionId = databaseBuilder.factory.buildSession().id;
        const secondPublishedSessionId = databaseBuilder.factory.buildSession().id;
        const unpublishedSessionId = databaseBuilder.factory.buildSession().id;
        _buildCertificationForSession({ userId, sessionId: firstPublishedSessionId, isPublished: true, pixScore: 400 });
        _buildCertificationForSession({
          userId,
          sessionId: secondPublishedSessionId,
          isPublished: true,
          pixScore: 500,
        });
        _buildCertificationForSession({ userId, sessionId: unpublishedSessionId, isPublished: false });
        await databaseBuilder.commit();

        // when
        const actualPixCertifications = await pixCertificationRepository.findByUserId({ userId });

        // then
        const expectedResult = [
          domainBuilder.certification.enrolment.buildPixCertification({
            pixScore: 400,
            status: 'validated',
            isCancelled: false,
            isRejectedForFraud: false,
          }),
          domainBuilder.certification.enrolment.buildPixCertification({
            pixScore: 500,
            status: 'validated',
            isCancelled: false,
            isRejectedForFraud: false,
          }),
        ];
        expect(actualPixCertifications).to.have.deep.members(expectedResult);
      });
    });
  });
});

function _buildCertificationForSession({ userId, sessionId, isPublished, pixScore = 200 }) {
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    sessionId,
    userId,
    isPublished,
  }).id;

  const assessmentId = databaseBuilder.factory.buildAssessment({
    certificationCourseId,
    userId,
  }).id;

  databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    certificationCourseId,
    pixScore: 100,
  });

  const assessmentResultId = databaseBuilder.factory.buildAssessmentResult({
    assessmentId,
    certificationCourseId,
    pixScore,
  }).id;

  databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
    certificationCourseId,
    lastAssessmentResultId: assessmentResultId,
  });
}
