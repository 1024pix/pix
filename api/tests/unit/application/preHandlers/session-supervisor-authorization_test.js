import { expect, sinon, hFake } from '../../../test-helper.js';
import { sessionSupervisorAuthorization } from '../../../../lib/application/preHandlers/session-supervisor-authorization.js';

describe('Unit | Pre-handler | Supervisor Authorization', function () {
  let supervisorAccessRepository;
  let requestResponseUtils;
  let dependencies;

  beforeEach(function () {
    supervisorAccessRepository = {
      isUserSupervisorForSessionCandidate: sinon.stub(),
      isUserSupervisorForSession: sinon.stub(),
    };
    requestResponseUtils = { extractUserIdFromRequest: sinon.stub() };
    dependencies = { supervisorAccessRepository, requestResponseUtils };
  });

  describe('#verifyByCertificationCandidateId', function () {
    const request = {
      params: {
        id: 8,
      },
    };

    describe('When user is the supervisor of the assessment session', function () {
      it('should return true', async function () {
        // given
        requestResponseUtils.extractUserIdFromRequest.returns(100);
        supervisorAccessRepository.isUserSupervisorForSessionCandidate
          .withArgs({
            certificationCandidateId: 8,
            supervisorId: 100,
          })
          .resolves(true);

        // when
        const response = await sessionSupervisorAuthorization.verifyByCertificationCandidateId(
          request,
          hFake,
          dependencies
        );

        // then
        expect(response).to.be.true;
      });
    });

    describe('When user is not the supervisor of the assessment session', function () {
      it('should return 401', async function () {
        // given
        requestResponseUtils.extractUserIdFromRequest.returns(100);
        supervisorAccessRepository.isUserSupervisorForSessionCandidate
          .withArgs({
            certificationCandidateId: 8,
            supervisorId: 100,
          })
          .resolves(false);

        // when
        const response = await sessionSupervisorAuthorization.verifyByCertificationCandidateId(
          request,
          hFake,
          dependencies
        );

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('#verifyBySessionId', function () {
    const request = {
      params: {
        id: 201,
      },
    };

    describe('When user is the supervisor of the assessment session', function () {
      it('should return true', async function () {
        // given
        requestResponseUtils.extractUserIdFromRequest.returns(100);

        supervisorAccessRepository.isUserSupervisorForSession.resolves(true);

        // when
        const response = await sessionSupervisorAuthorization.verifyBySessionId(request, hFake, dependencies);

        // then
        sinon.assert.calledWith(supervisorAccessRepository.isUserSupervisorForSession, {
          sessionId: 201,
          userId: 100,
        });
        expect(response).to.be.true;
      });
    });

    describe('When user is not the supervisor of the session', function () {
      it('should return status code 401', async function () {
        // given
        requestResponseUtils.extractUserIdFromRequest.returns(101);
        supervisorAccessRepository.isUserSupervisorForSession.resolves(false);

        // when
        const response = await sessionSupervisorAuthorization.verifyBySessionId(request, hFake, dependencies);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
