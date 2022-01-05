const { expect, sinon, catchErr, hFake } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const certificationCandidateController = require('../../../../lib/application/certification-candidates/certification-candidates-controller');
const endTestScreenRemovalService = require('../../../../lib/domain/services/end-test-screen-removal-service');
const { NotFoundError } = require('../../../../lib/application/http-errors');

describe('Unit | Controller | certifications-candidate-controller', function () {
  describe('#authorizeToStart', function () {
    describe('when end screen removal is enabled', function () {
      it('should return a 204 status code', async function () {
        // given
        sinon.stub(endTestScreenRemovalService, 'isEndTestScreenRemovalEnabledByCandidateId');
        endTestScreenRemovalService.isEndTestScreenRemovalEnabledByCandidateId.withArgs(99).resolves(true);
        const request = {
          auth: {
            credentials: { userId: '111' },
          },
          params: {
            id: 99,
          },
          payload: { 'authorized-to-start': true },
        };

        usecases.authorizeCertificationCandidateToStart = sinon.stub().rejects();
        usecases.authorizeCertificationCandidateToStart
          .withArgs({
            certificationCandidateForSupervisingId: 99,
            authorizedToStart: true,
          })
          .resolves();

        // when
        const response = await certificationCandidateController.authorizeToStart(request, hFake);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    describe('when end test screen removal is not enabled', function () {
      it('should return a 404 status code', async function () {
        // given
        sinon.stub(endTestScreenRemovalService, 'isEndTestScreenRemovalEnabledByCandidateId');
        endTestScreenRemovalService.isEndTestScreenRemovalEnabledByCandidateId
          //   .withArgs(99)
          .resolves(false);

        const request = {
          auth: {
            credentials: { userId: '111' },
          },
          params: {
            id: 99,
          },
          payload: { 'authorized-to-start': true },
        };

        // when
        const error = await catchErr(certificationCandidateController.authorizeToStart)(request, hFake);
        certificationCandidateController.authorizeToStart(request, hFake);

        // then
        expect(error).to.be.an.instanceOf(NotFoundError);
      });
    });
  });

  describe('#authorizeToResume', function () {
    describe('when end test screen removal is enabled', function () {
      it('should return a 204 status code', async function () {
        // given
        sinon.stub(endTestScreenRemovalService, 'isEndTestScreenRemovalEnabledByCandidateId');
        endTestScreenRemovalService.isEndTestScreenRemovalEnabledByCandidateId.withArgs(99).resolves(true);
        const request = {
          auth: {
            credentials: { userId: '111' },
          },
          params: {
            id: 99,
          },
        };

        usecases.authorizeCertificationCandidateToResume = sinon.stub().rejects();
        usecases.authorizeCertificationCandidateToResume
          .withArgs({
            certificationCandidateId: 99,
          })
          .resolves();

        // when
        const response = await certificationCandidateController.authorizeToResume(request, hFake);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    describe('when end test screen removal is not enabled', function () {
      it('should return a 404 status code', async function () {
        // given
        sinon.stub(endTestScreenRemovalService, 'isEndTestScreenRemovalEnabledByCandidateId');
        endTestScreenRemovalService.isEndTestScreenRemovalEnabledByCandidateId.withArgs(99).resolves(false);

        const request = {
          auth: {
            credentials: { userId: '111' },
          },
          params: {
            id: 99,
          },
        };

        // when
        const error = await catchErr(certificationCandidateController.authorizeToResume)(request, hFake);

        // then
        expect(error).to.be.an.instanceOf(NotFoundError);
      });
    });
  });

  describe('#endAssessmentBySupervisor', function () {
    const certificationCandidateId = 2;

    beforeEach(function () {});

    it('should call the endAssessmentBySupervisor use case', async function () {
      // given
      sinon.stub(usecases, 'endAssessmentBySupervisor');
      usecases.endAssessmentBySupervisor.resolves();

      // when
      await certificationCandidateController.endAssessmentBySupervisor({
        params: { id: certificationCandidateId },
      });

      // then
      expect(usecases.endAssessmentBySupervisor).to.have.been.calledWithExactly({
        certificationCandidateId,
      });
    });
  });
});
