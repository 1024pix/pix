const { expect, databaseBuilder, catchErr, knex } = require('../../../test-helper');
const certificationRepository = require('../../../../lib/infrastructure/repositories/certification-repository');
const { CertificationCourseNotPublishableError } = require('../../../../lib/domain/errors');
const { status } = require('../../../../lib/domain/models/AssessmentResult');

describe('Integration | Repository | Certification', function () {
  describe('#publishCertificationCoursesBySessionId', function () {
    const sessionId = 200;
    beforeEach(function () {
      databaseBuilder.factory.buildSession({ id: sessionId });
      _buildValidatedCertification({ id: 1, sessionId, isPublished: false });
      _buildRejectedCertification({ id: 2, sessionId, isPublished: false });
      _buildCancelledCertification({ id: 3, sessionId, isPublished: false });
      return databaseBuilder.commit();
    });

    context('when some certifications latest assessment result is error', function () {
      beforeEach(function () {
        _buildErrorCertification({ id: 4, sessionId, isPublished: false });
        return databaseBuilder.commit();
      });

      it('should throw a CertificationCourseNotPublishableError without publishing any certification nor setting pixCertificationStatus', async function () {
        // when
        const err = await catchErr(certificationRepository.publishCertificationCoursesBySessionId)(sessionId);

        // then
        const isPublishedStates = await knex('certification-courses').pluck('isPublished').where({ sessionId });
        const pixCertificationStatuses = await knex('certification-courses')
          .pluck('pixCertificationStatus')
          .where({ sessionId });
        expect(err).to.be.instanceOf(CertificationCourseNotPublishableError);
        expect(isPublishedStates).to.deep.equal([false, false, false, false]);
        expect(pixCertificationStatuses).to.deep.equal([null, null, null, null]);
      });
    });

    context('when some certification are still started', function () {
      beforeEach(function () {
        _buildStartedCertification({ id: 4, sessionId, isPublished: false });
        return databaseBuilder.commit();
      });

      it('should throw a CertificationCourseNotPublishableError without publishing any certification nor setting pixCertificationStatus', async function () {
        // when
        const err = await catchErr(certificationRepository.publishCertificationCoursesBySessionId)(sessionId);

        // then
        const isPublishedStates = await knex('certification-courses').pluck('isPublished').where({ sessionId });
        const pixCertificationStatuses = await knex('certification-courses')
          .pluck('pixCertificationStatus')
          .where({ sessionId });
        expect(err).to.be.instanceOf(CertificationCourseNotPublishableError);
        expect(isPublishedStates).to.deep.equal([false, false, false, false]);
        expect(pixCertificationStatuses).to.deep.equal([null, null, null, null]);
      });
    });

    context(
      'when all certification latest assessment result are validated, rejected or certification is cancelled',
      function () {
        it('should set certifications as published within the session and update pixCertificationStatus according to assessment result status', async function () {
          // when
          await certificationRepository.publishCertificationCoursesBySessionId(sessionId);

          // then
          const isPublishedStates = await knex('certification-courses').pluck('isPublished').where({ sessionId });
          const pixCertificationStatuses = await knex('certification-courses')
            .pluck('pixCertificationStatus')
            .where({ sessionId })
            .orderBy('id');
          expect(isPublishedStates).to.deep.equal([true, true, true]);
          expect(pixCertificationStatuses).to.deep.equal([status.VALIDATED, status.REJECTED, null]);
        });
      }
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
      const pixCertificationStatuses = await knex('certification-courses')
        .pluck('pixCertificationStatus')
        .where({ sessionId });
      expect(isPublishedStates).to.deep.equal([false, false, false, false, false]);
      expect(pixCertificationStatuses).to.deep.equal([null, null, null, null, null]);
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
    const { id: lastAssessmentResultId } = databaseBuilder.factory.buildAssessmentResult({
      assessmentId: id,
      createdAt: new Date('2021-01-01'),
      status,
    });
    databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
      certificationCourseId: id,
      lastAssessmentResultId,
    });
  }
}
