const { expect, sinon, hFake } = require('../../../test-helper');
const sessionSupervisorAuthorization = require('../../../../lib/application/preHandlers/session-supervisor-authorization');
const supervisorAccessRepository = require('../../../../lib/infrastructure/repositories/supervisor-access-repository');
const requestResponseUtils = require('../../../../lib/infrastructure/utils/request-response-utils');

describe('Unit | Pre-handler | Supervisor Authorization', function () {
  describe('#verifyByCertificationCandidateId', function () {
    const request = {
      params: {
        id: 8,
      },
    };

    beforeEach(function () {
      sinon.stub(supervisorAccessRepository, 'isUserSupervisorForSessionCandidate');
      sinon.stub(requestResponseUtils, 'extractUserIdFromRequest');
    });

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
        const response = await sessionSupervisorAuthorization.verifyByCertificationCandidateId(request, hFake);

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
        const response = await sessionSupervisorAuthorization.verifyByCertificationCandidateId(request, hFake);

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

    beforeEach(function () {
      sinon.stub(supervisorAccessRepository, 'isUserSupervisorForSession');
      sinon.stub(requestResponseUtils, 'extractUserIdFromRequest');
    });

    describe('When user is the supervisor of the assessment session', function () {
      it('should return true', async function () {
        // given
        requestResponseUtils.extractUserIdFromRequest.returns(100);

        supervisorAccessRepository.isUserSupervisorForSession.resolves(true);

        // when
        const response = await sessionSupervisorAuthorization.verifyBySessionId(request, hFake);

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
        const response = await sessionSupervisorAuthorization.verifyBySessionId(request, hFake);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
