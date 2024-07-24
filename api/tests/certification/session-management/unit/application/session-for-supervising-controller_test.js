import { sessionForSupervisingController } from '../../../../../src/certification/session-management/application/session-for-supervising-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import * as sessionForSupervisingSerializer from '../../../../../src/certification/session-management/infrastructure/serializers/session-for-supervising-serializer.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Session Management | Unit | Application | Controller | Session For Supervising', function () {
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
});
