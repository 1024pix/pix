const { expect, sinon, hFake, domainBuilder, catchErr } = require('../../../test-helper');
const sessionForSupervisingController = require('../../../../lib/application/sessions/session-for-supervising-controller');
const usecases = require('../../../../lib/domain/usecases');
const sessionForSupervisingSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/session-for-supervising-serializer');
const { NotFoundError } = require('../../../../lib/application/http-errors');
const endTestScreenRemovalService = require('../../../../lib/domain/services/end-test-screen-removal-service');

describe('Unit | Controller | session-for-supervising', function () {
  describe('#get', function () {
    context('when end screen removal is enabled', function () {
      it('should return a session for supervising', async function () {
        // given
        sinon.stub(endTestScreenRemovalService, 'isEndTestScreenRemovalEnabledBySessionId');
        endTestScreenRemovalService.isEndTestScreenRemovalEnabledBySessionId.withArgs(123).resolves(true);
        const request = {
          params: {
            id: 123,
          },
          auth: {
            credentials: {
              userId: 274939274,
            },
          },
        };
        const foundSession = domainBuilder.buildSessionForSupervising({ id: 123 });
        const serializedSession = sessionForSupervisingSerializer.serialize(foundSession);
        sinon.stub(usecases, 'getSessionForSupervising');
        usecases.getSessionForSupervising.withArgs({ sessionId: 123 }).resolves(foundSession);

        // when
        const response = await sessionForSupervisingController.get(request, hFake);

        // then
        expect(response).to.deep.equal(serializedSession);
      });
    });

    context('when end screen removal is disabled', function () {
      it('should throw a NotFoundError', async function () {
        // given
        sinon.stub(endTestScreenRemovalService, 'isEndTestScreenRemovalEnabledBySessionId');
        endTestScreenRemovalService.isEndTestScreenRemovalEnabledBySessionId.withArgs(123).resolves(false);
        const request = {
          params: {
            id: 123,
          },
          auth: {
            credentials: {
              userId: 274939274,
            },
          },
        };

        // when
        const error = await catchErr(sessionForSupervisingController.get)(request);

        // then
        expect(error).to.be.instanceof(NotFoundError);
      });
    });
  });

  describe('#supervise', function () {
    context('when end screen removal is enabled for the session', function () {
      it('should return a HTTP 204 No Content', async function () {
        // given
        sinon.stub(endTestScreenRemovalService, 'isEndTestScreenRemovalEnabledBySessionId');
        endTestScreenRemovalService.isEndTestScreenRemovalEnabledBySessionId.withArgs(123).resolves(true);
        const request = {
          auth: {
            credentials: {
              userId: 274939274,
            },
          },
          payload: {
            data: {
              attributes: {
                'session-id': '123',
                'supervisor-password': '567',
              },
            },
          },
        };
        sinon.stub(usecases, 'superviseSession');
        usecases.superviseSession
          .withArgs({ sessionId: '123', userId: 274939274, supervisorPassword: '567' })
          .resolves();

        // when
        const response = await sessionForSupervisingController.supervise(request, hFake);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    context('when end screen removal is disabled', function () {
      it('should throw a NotFoundError', async function () {
        // given
        sinon.stub(endTestScreenRemovalService, 'isEndTestScreenRemovalEnabledBySessionId');
        endTestScreenRemovalService.isEndTestScreenRemovalEnabledBySessionId.withArgs(123).resolves(false);
        const request = {
          auth: {
            credentials: {
              userId: 274939274,
            },
          },
          payload: {
            data: {
              attributes: {
                'session-id': '123',
                'supervisor-password': '567',
              },
            },
          },
        };

        // when
        const error = await catchErr(sessionForSupervisingController.supervise)(request);

        // then
        expect(error).to.be.instanceof(NotFoundError);
      });
    });
  });
});
