import sinon from 'sinon';

import { certificationCandidateController } from '../../../../../src/certification/session-management/application/certification-candidate-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Certification | Session Management | Unit | Application | Controller | Certification Candidate', function () {
  let dependencies;

  beforeEach(function () {
    dependencies = {
      supervisedCandidateRepository: {
        authorizeToStart: sinon.stub(),
        unauthorizeToStart: sinon.stub(),
      },
    };
  });

  describe('#authorizeToStart', function () {
    it('should return a 204 status code and call authorize', async function () {
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
      dependencies.supervisedCandidateRepository.authorizeToStart.withArgs(99).resolves();
      dependencies.supervisedCandidateRepository.unauthorizeToStart.withArgs(99).rejects();

      // when
      const response = await certificationCandidateController.authorizeToStart(request, hFake, dependencies);

      // then
      expect(response.statusCode).to.equal(204);
    });

    it('should return a 204 status code and call unauthorize', async function () {
      // given
      const request = {
        auth: {
          credentials: { userId: '111' },
        },
        params: {
          certificationCandidateId: 99,
        },
        payload: { 'authorized-to-start': false },
      };
      dependencies.supervisedCandidateRepository.unauthorizeToStart.withArgs(99).resolves();
      dependencies.supervisedCandidateRepository.authorizeToStart.withArgs(99).rejects();

      // when
      const response = await certificationCandidateController.authorizeToStart(request, hFake, dependencies);

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
      dependencies.supervisedCandidateRepository.authorizeToStart.withArgs(99).resolves();
      dependencies.supervisedCandidateRepository.unauthorizeToStart.withArgs(99).rejects();

      // when
      const response = await certificationCandidateController.authorizeToResume(request, hFake, dependencies);

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
