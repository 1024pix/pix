import { expect, sinon, hFake, domainBuilder } from '../../../test-helper.js';
import { sessionForSupervisingController } from '../../../../lib/shared/application/sessions/session-for-supervising-controller.js';
import { usecases } from '../../../../lib/shared/domain/usecases/index.js';
import * as sessionForSupervisingSerializer from '../../../../lib/shared/infrastructure/serializers/jsonapi/session-for-supervising-serializer.js';

describe('Unit | Controller | session-for-supervising', function () {
  describe('#get', function () {
    it('should return a session for supervising', async function () {
      // given
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

  describe('#supervise', function () {
    it('should return a HTTP 204 No Content', async function () {
      // given
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
      usecases.superviseSession.withArgs({ sessionId: '123', userId: 274939274, supervisorPassword: '567' }).resolves();

      // when
      const response = await sessionForSupervisingController.supervise(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });
});
