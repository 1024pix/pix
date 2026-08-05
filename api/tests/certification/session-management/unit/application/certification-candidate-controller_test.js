import { expect } from 'chai';
import sinon from 'sinon';

import { certificationCandidateController } from '../../../../../src/certification/session-management/application/certification-candidate-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { normalize } from '../../../../../src/shared/infrastructure/utils/string-utils.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Certification | Session Management | Unit | Application | Controller | Certification Candidate', function () {
  let dependencies;

  beforeEach(function () {
    dependencies = {
      supervisedCandidateRepository: {
        authorizeToStart: sinon.stub(),
        unauthorizeToStart: sinon.stub(),
      },
      eventAdapter: {
        onCandidateAuthorizedToStart: sinon.stub(),
        onCandidateUnauthorizedToStart: sinon.stub(),
        onCandidateAuthorizedToResume: sinon.stub(),
      },
    };
  });

  afterEach(function () {
    sinon.restore();
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
      const someDateForAuthorizedtoStartAt = new Date('2021-02-03');
      dependencies.supervisedCandidateRepository.authorizeToStart.withArgs(99).resolves(someDateForAuthorizedtoStartAt);
      dependencies.supervisedCandidateRepository.unauthorizeToStart.withArgs(99).rejects();

      // when
      const response = await certificationCandidateController.authorizeToStart(request, hFake, dependencies);

      // then
      expect(response.statusCode).to.equal(204);
      sinon.assert.calledOnceWith(dependencies.eventAdapter.onCandidateAuthorizedToStart, {
        candidateId: 99,
        authorizedToStartAt: someDateForAuthorizedtoStartAt,
      });
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
      sinon.assert.calledOnceWith(dependencies.eventAdapter.onCandidateUnauthorizedToStart, {
        candidateId: 99,
      });
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
      const someDateForAuthorizedtoStartAt = new Date('2021-02-03');
      dependencies.supervisedCandidateRepository.authorizeToStart.withArgs(99).resolves(someDateForAuthorizedtoStartAt);
      dependencies.supervisedCandidateRepository.unauthorizeToStart.withArgs(99).rejects();

      // when
      const response = await certificationCandidateController.authorizeToResume(request, hFake, dependencies);

      // then
      expect(response.statusCode).to.equal(204);
      sinon.assert.calledOnceWith(dependencies.eventAdapter.onCandidateAuthorizedToResume, {
        candidateId: 99,
        authorizedToStartAt: someDateForAuthorizedtoStartAt,
      });
    });
  });

  describe('#endAssessmentByInvigilator', function () {
    it('should call the endAssessmentByInvigilator use case', async function () {
      // given
      sinon.stub(usecases, 'endAssessmentByInvigilator');
      usecases.endAssessmentByInvigilator.resolves();

      // when
      await certificationCandidateController.endAssessmentByInvigilator({
        params: { certificationCandidateId: 2 },
      });

      // then
      sinon.assert.calledWithExactly(usecases.endAssessmentByInvigilator, { certificationCandidateId: 2 });
    });
  });

  describe('#createCandidateParticipation', function () {
    it('should return candidate information', async function () {
      // given
      const sessionId = 123;
      const userId = 274939274;
      const firstName = 'Jeanne';
      const lastName = 'Serge';
      const birthdate = '2020-10-10';

      const request = {
        payload: {
          data: {
            attributes: {
              'first-name': firstName,
              'last-name': lastName,
              birthdate,
            },
          },
        },
        auth: { credentials: { userId } },
        params: { sessionId },
        headers: { origin: 'https://app.pix.fr' },
      };
      const candidate = {
        firstName,
        lastName,
        birthdate,
        sessionId,
        hasSeenCertificationInstructions: false,
      };

      sinon.stub(usecases, 'registerCandidateParticipation').resolves();
      usecases.registerCandidateParticipation
        .withArgs({
          userId,
          sessionId,
          firstName,
          lastName,
          birthdate,
          isFrenchDomainExtension: true,
          normalizeStringFnc: normalize,
        })
        .resolves(candidate);

      // when
      const response = await certificationCandidateController.createCandidateParticipation(request, hFake);

      // then
      expect(response.source).to.deep.equal({
        data: {
          attributes: {
            birthdate,
            'first-name': firstName,
            'has-seen-certification-instructions': false,
            'last-name': lastName,
            'session-id': sessionId,
          },
          type: 'certification-candidates',
        },
      });
    });
  });
});
