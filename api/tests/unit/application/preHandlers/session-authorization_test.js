const { expect, sinon, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/application/http-errors');
const SessionAuthorization = require('../../../../lib/application/preHandlers/session-authorization');
const sessionAuthorizationService = require('../../../../lib/domain/services/session-authorization-service');

describe('Unit | Pre-handler | Session Authorization', () => {
  const userId = 1;
  const sessionId = 2;

  describe('#verify', () => {
    const request = {
      auth: { credentials: { accessToken: 'valid.access.token', userId } },
      params: {
        id: sessionId,
      }
    };

    beforeEach(() => {
      sinon.stub(sessionAuthorizationService, 'isAuthorizedToAccessSession');
    });

    it('should be a function', () => {
      // then
      expect(SessionAuthorization.verify).to.be.a('function');
    });

    context('when user has access to session', () => {

      it('should reply with true', async () => {
        // given
        sessionAuthorizationService.isAuthorizedToAccessSession.withArgs({ userId, sessionId }).resolves(true);

        // when
        const response = await SessionAuthorization.verify(request);

        // then
        expect(response).to.deep.equal(true);
      });
    });

    context('when user has no access to session', () => {

      it('should throw a NotFoundError', async () => {
        // given
        sessionAuthorizationService.isAuthorizedToAccessSession.withArgs({ userId, sessionId }).resolves(false);

        // when
        const error = await catchErr(SessionAuthorization.verify)(request);

        // then
        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });
});
