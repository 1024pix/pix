import { expect, databaseBuilder, knex, sinon } from '../../../test-helper.js';
import * as certificationRepository from '../../../../lib/infrastructure/repositories/certification-repository.js';
import { AssessmentResult, status } from '../../../../src/shared/domain/models/AssessmentResult.js';

describe('Integration | Repository | Certification', function () {
  describe('#getStatusesBySessionId', function () {
    it('should get status information', async function () {
      // given
      const sessionId = 200;
      databaseBuilder.factory.buildSession({ id: sessionId + 1 });
      databaseBuilder.factory.buildSession({ id: sessionId });
      _buildValidatedCertification({ id: 1, sessionId, isPublished: false });
      _buildValidatedCertification({ id: 2, sessionId: sessionId + 1, isPublished: false });
      _buildRejectedCertification({ id: 3, sessionId, isPublished: false });
      _buildCancelledCertification({ id: 4, sessionId, isPublished: false });
      await databaseBuilder.commit();

      // when
      const statuses = await certificationRepository.getStatusesBySessionId(sessionId);

      // then

      expect(statuses).to.have.length(3);
      expect(statuses).to.deep.equal([
        {
          certificationCourseId: 1,
          isCancelled: false,
          pixCertificationStatus: AssessmentResult.status.VALIDATED,
        },
        {
          certificationCourseId: 3,
          isCancelled: false,
          pixCertificationStatus: AssessmentResult.status.REJECTED,
        },
        {
          certificationCourseId: 4,
          isCancelled: true,
          pixCertificationStatus: null,
        },
      ]);
    });
  });

  describe('#publishCertificationCoursesBySessionId', function () {
    const sessionId = 200;
    beforeEach(function () {
      databaseBuilder.factory.buildSession({ id: sessionId });
      _buildValidatedCertification({ id: 1, sessionId, isPublished: false });
      _buildRejectedCertification({ id: 2, sessionId, isPublished: false });
      _buildCancelledCertification({ id: 3, sessionId, isPublished: false });
      return databaseBuilder.commit();
    });

    context(
      'when all certification latest assessment result are validated, rejected or certification is cancelled',
      function () {
        let clock;
        const now = new Date('2022-12-25');

        beforeEach(function () {
          clock = sinon.useFakeTimers({
            now,
            toFake: ['Date'],
          });
        });

        afterEach(async function () {
          clock.restore();
        });

        it('should set certifications as published within the session and update pixCertificationStatus according to assessment result status', async function () {
          // when
          await certificationRepository.publishCertificationCourses([
            { certificationCourseId: 1, pixCertificationStatus: status.VALIDATED },
            { certificationCourseId: 2, pixCertificationStatus: status.REJECTED },
            { certificationCourseId: 3, pixCertificationStatus: null },
          ]);

          // then
          const certifications = await knex('certification-courses')
            .select('id', 'isPublished', 'pixCertificationStatus', 'updatedAt', 'version')
            .where({ sessionId });
          expect(certifications).to.deep.equal([
            {
              id: 1,
              isPublished: true,
              pixCertificationStatus: status.VALIDATED,
              updatedAt: now,
              version: 2,
            },
            {
              id: 2,
              isPublished: true,
              pixCertificationStatus: status.REJECTED,
              updatedAt: now,
              version: 2,
            },
            {
              id: 3,
              isPublished: true,
              pixCertificationStatus: null,
              updatedAt: now,
              version: 2,
            },
          ]);
        });
      },
    );
  });

  describe('#unpublishCertificationCoursesBySessionId', function () {
    const sessionId = 200;
    beforeEach(function () {
      databaseBuilder.factory.buildSession({ id: sessionId });
      _buildValidatedCertification({ id: 1, sessionId, isPublished: true, pixCertificationStatus: status.VALIDATED });
      _buildRejectedCertification({ id: 2, sessionId, isPublished: true, pixCertificationStatus: status.VALIDATED });
      _buildCancelledCertification({ id: 3, sessionId, isPublished: true });
      _buildErrorCertification({ id: 4, sessionId, isPublished: true, pixCertificationStatus: status.VALIDATED });
      _buildStartedCertification({ id: 5, sessionId, isPublished: true, pixCertificationStatus: status.VALIDATED });
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

function _buildValidatedCertification({ id, sessionId, isPublished, pixCertificationStatus }) {
  _buildCertification({ id, sessionId, isPublished, status: status.VALIDATED, pixCertificationStatus });
}

function _buildRejectedCertification({ id, sessionId, isPublished, pixCertificationStatus }) {
  _buildCertification({ id, sessionId, isPublished, status: status.REJECTED, pixCertificationStatus });
}

function _buildErrorCertification({ id, sessionId, isPublished, pixCertificationStatus }) {
  _buildCertification({ id, sessionId, isPublished, status: status.ERROR, pixCertificationStatus });
}

function _buildStartedCertification({ id, sessionId, isPublished, pixCertificationStatus }) {
  _buildCertification({ id, sessionId, isPublished, status: null, pixCertificationStatus });
}

function _buildCancelledCertification({ id, sessionId, isPublished }) {
  _buildCertification({ id, sessionId, isPublished, isCancelled: true, status: null });
}

function _buildCertification({
  id,
  sessionId,
  status,
  isPublished,
  isCancelled = false,
  pixCertificationStatus = null,
}) {
  databaseBuilder.factory.buildCertificationCourse({ id, sessionId, isPublished, isCancelled, pixCertificationStatus });
  databaseBuilder.factory.buildAssessment({ id, certificationCourseId: id });
  if (status) {
    // not the latest
    databaseBuilder.factory.buildAssessmentResult({
      assessmentId: id,
      createdAt: new Date('2020-01-01'),
      status: status.VALIDATED,
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
