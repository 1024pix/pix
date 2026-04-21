import sinon from 'sinon';

import { certificationCandidateController } from '../../../../../src/certification/session-management/application/certification-candidate-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Certification | Session Management | Unit | Application | Controller | Certification Candidate', function () {
  describe('#authorizeToStart', function () {
    it('should return a 204 status code', async function () {
      // given
      const request = {
        auth: {
          credentials: { userId: '111' },
        },
        params: {
          certificationCandidateId: 99,
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
          certificationCandidateId: 99,
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

  describe('#endAssessmentByInvigilator', function () {
    it('should call the endAssessmentByInvigilator use case', async function () {
      // given
      const certificationCandidateId = 2;
      sinon.stub(usecases, 'endAssessmentByInvigilator');
      usecases.endAssessmentByInvigilator.resolves();

      // when
      await certificationCandidateController.endAssessmentByInvigilator({
        params: { certificationCandidateId },
      });

      // then
      expect(usecases.endAssessmentByInvigilator).to.have.been.calledWithExactly({
        certificationCandidateId,
      });
    });
  });
});
