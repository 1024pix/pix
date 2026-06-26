import sinon from 'sinon';

import { assessmentInvigilatorAuthorization as sessionInvigilatorAuthorization } from '../../../../../../src/certification/shared/application/pre-handlers/session-invigilator-authorization.js';
import { expect } from '../../../../../test-helper.js';
import { hFake } from '../../../../../tooling/mocks/hapi.mock.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../../tooling/test-utils/http-server.js';

describe('Unit | Pre-handler | Invigilator Authorization', function () {
  let invigilatorAccessRepository;
  let dependencies;

  beforeEach(function () {
    invigilatorAccessRepository = {
      isUserInvigilatorForSessionCandidate: sinon.stub(),
      isUserInvigilatorForSession: sinon.stub(),
    };
    dependencies = { invigilatorAccessRepository };
  });

  describe('#verifyByCertificationCandidateId', function () {
    const request = {
      headers: generateAuthenticatedUserRequestHeaders({ userId: 100 }),
      params: {
        certificationCandidateId: 8,
      },
    };

    describe('When user is the invigilator of the assessment session', function () {
      it('should return true', async function () {
        // given
        invigilatorAccessRepository.isUserInvigilatorForSessionCandidate
          .withArgs({
            certificationCandidateId: 8,
            invigilatorId: 100,
          })
          .resolves(true);

        // when
        const response = await sessionInvigilatorAuthorization.verifyByCertificationCandidateId(
          request,
          hFake,
          dependencies,
        );

        // then
        expect(response).to.be.true;
      });
    });

    describe('When user is not the invigilator of the assessment session', function () {
      it('should return 401', async function () {
        // given
        invigilatorAccessRepository.isUserInvigilatorForSessionCandidate
          .withArgs({
            certificationCandidateId: 8,
            invigilatorId: 100,
          })
          .resolves(false);

        // when
        const response = await sessionInvigilatorAuthorization.verifyByCertificationCandidateId(
          request,
          hFake,
          dependencies,
        );

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('#verifyBySessionId', function () {
    const request = {
      headers: generateAuthenticatedUserRequestHeaders({ userId: 100 }),
      params: {
        sessionId: 201,
      },
    };

    describe('When user is the invigilator of the assessment session', function () {
      it('should return true', async function () {
        // given
        invigilatorAccessRepository.isUserInvigilatorForSession.resolves(true);

        // when
        const response = await sessionInvigilatorAuthorization.verifyBySessionId(request, hFake, dependencies);

        // then
        sinon.assert.calledWith(invigilatorAccessRepository.isUserInvigilatorForSession, {
          sessionId: 201,
          userId: 100,
        });
        expect(response).to.be.true;
      });
    });

    describe('When user is not the invigilator of the session', function () {
      it('should return status code 401', async function () {
        // given
        invigilatorAccessRepository.isUserInvigilatorForSession.resolves(false);
        request.headers = generateAuthenticatedUserRequestHeaders({ userId: 101 });

        // when
        const response = await sessionInvigilatorAuthorization.verifyBySessionId(request, hFake, dependencies);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
