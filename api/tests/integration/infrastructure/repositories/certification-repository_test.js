import * as certificationRepository from '../../../../lib/infrastructure/repositories/certification-repository.js';
import { status } from '../../../../src/shared/domain/models/AssessmentResult.js';
import { databaseBuilder, expect, knex } from '../../../test-helper.js';

describe('Integration | Repository | Certification', function () {
  describe('#unpublishCertificationCoursesBySessionId', function () {
    const sessionId = 200;

    beforeEach(function () {
      databaseBuilder.factory.buildSession({ id: sessionId });
      _buildValidatedCertification({ id: 1, sessionId, isPublished: true });
      _buildRejectedCertification({ id: 2, sessionId, isPublished: true });
      _buildCancelledCertification({ id: 3, sessionId, isPublished: true });
      _buildErrorCertification({ id: 4, sessionId, isPublished: true });
      _buildStartedCertification({ id: 5, sessionId, isPublished: true });
      return databaseBuilder.commit();
    });

    it('should unpublish all certifications within a session and erase pixCertificationStatus', async function () {
      // when
      await certificationRepository.unpublishCertificationCoursesBySessionId(sessionId);

      // then
      const isPublishedStates = await knex('certification-courses').pluck('isPublished').where({ sessionId });
      expect(isPublishedStates).to.deep.equal([false, false, false, false, false]);
    });
  });
});

function _buildValidatedCertification({ id, sessionId, isPublished }) {
  _buildCertification({ id, sessionId, isPublished, status: status.VALIDATED });
}

function _buildRejectedCertification({ id, sessionId, isPublished }) {
  _buildCertification({ id, sessionId, isPublished, status: status.REJECTED });
}

function _buildErrorCertification({ id, sessionId, isPublished }) {
  _buildCertification({ id, sessionId, isPublished, status: status.ERROR });
}

function _buildStartedCertification({ id, sessionId, isPublished }) {
  _buildCertification({ id, sessionId, isPublished, status: null });
}

function _buildCancelledCertification({ id, sessionId, isPublished }) {
  _buildCertification({ id, sessionId, isPublished, isCancelled: true, status: null });
}

function _buildCertification({ id, sessionId, status, isPublished, isCancelled = false }) {
  databaseBuilder.factory.buildCertificationCourse({ id, sessionId, isPublished, isCancelled });
  databaseBuilder.factory.buildAssessment({ id, certificationCourseId: id });
  if (status) {
    // not the latest
    databaseBuilder.factory.buildAssessmentResult({
      assessmentId: id,
      createdAt: new Date('2020-01-01'),
      status,
    });
    // the latest
    databaseBuilder.factory.buildAssessmentResult.last({
      certificationCourseId: id,
      assessmentId: id,
      createdAt: new Date('2021-01-01'),
      status,
    });
  }
}
