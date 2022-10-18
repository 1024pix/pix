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
      return databaseBuilder.commit();
    });

    context('when some certifications latest assessment result is error', function () {
      beforeEach(function () {
        _buildErrorCertification({ id: 3, sessionId, isPublished: false });
        return databaseBuilder.commit();
      });

      it('should throw a CertificationCourseNotPublishableError without publishing any certification', async function () {
        // when
        const err = await catchErr(certificationRepository.publishCertificationCoursesBySessionId)(sessionId);

        // then
        const isPublishedStates = await knex('certification-courses').pluck('isPublished').where({ sessionId });
        expect(err).to.be.instanceOf(CertificationCourseNotPublishableError);
        expect(isPublishedStates).to.deepEqualArray([false, false, false]);
      });
    });

    context('when some certification are still started', function () {
      beforeEach(function () {
        _buildStartedCertification({ id: 3, sessionId, isPublished: false });
        return databaseBuilder.commit();
      });

      it('should throw a CertificationCourseNotPublishableError without publishing any certification', async function () {
        // when
        const err = await catchErr(certificationRepository.publishCertificationCoursesBySessionId)(sessionId);

        // then
        const isPublishedStates = await knex('certification-courses').pluck('isPublished').where({ sessionId });
        expect(err).to.be.instanceOf(CertificationCourseNotPublishableError);
        expect(isPublishedStates).to.deepEqualArray([false, false, false]);
      });
    });

    context('when all certification latest assessment result are validated or rejected', function () {
      it('should set certifications as published within the session', async function () {
        // when
        await certificationRepository.publishCertificationCoursesBySessionId(sessionId);

        // then
        const isPublishedStates = await knex('certification-courses').pluck('isPublished').where({ sessionId });
        expect(isPublishedStates).to.deepEqualArray([true, true]);
      });
    });
  });

  describe('#unpublishCertificationCoursesBySessionId', function () {
    const sessionId = 200;
    beforeEach(function () {
      databaseBuilder.factory.buildSession({ id: sessionId });
      _buildValidatedCertification({ id: 1, sessionId, isPublished: true });
      _buildRejectedCertification({ id: 2, sessionId, isPublished: true });
      _buildErrorCertification({ id: 3, sessionId, isPublished: true });
      _buildStartedCertification({ id: 4, sessionId, isPublished: true });
      return databaseBuilder.commit();
    });

    it('should unpublish all certifications within a session', async function () {
      // when
      await certificationRepository.unpublishCertificationCoursesBySessionId(sessionId);

      // then
      const isPublishedStates = await knex('certification-courses').pluck('isPublished').where({ sessionId });
      expect(isPublishedStates).to.deepEqualArray([false, false, false, false]);
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

function _buildCertification({ id, sessionId, status, isPublished }) {
  databaseBuilder.factory.buildCertificationCourse({ id, sessionId, isPublished });
  databaseBuilder.factory.buildAssessment({ id, certificationCourseId: id });
  if (status) {
    // not the latest
    databaseBuilder.factory.buildAssessmentResult({
      assessmentId: id,
      createdAt: new Date('2020-01-01'),
      status: status.VALIDATED,
    });
    // the latest
    databaseBuilder.factory.buildAssessmentResult({ assessmentId: id, createdAt: new Date('2021-01-01'), status });
  }
}
