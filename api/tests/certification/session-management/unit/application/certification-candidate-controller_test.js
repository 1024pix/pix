import { certificationCandidateController } from '../../../../../src/certification/session-management/application/certification-candidate-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Session Management | Unit | Application | Controller | Certification Candidate', function () {
  describe('#authorizeToStart', function () {
    it('should return a 204 status code', async function () {
      // given
      const request = {
        auth: {
          credentials: { userId: '111' },
        },
        params: {
          id: 99,
        },
        payload: { 'authorized-to-start': true },
      };

      sinon.stub(usecases, 'authorizeCertificationCandidateToStart');

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

  describe('#authorizeToResume', function () {
    it('should return a 204 status code', async function () {
      // given
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

  describe('#endAssessmentBySupervisor', function () {
    const certificationCandidateId = 2;

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
