import { sessionLiveAlertController } from '../../../../../src/certification/session-management/application/session-live-alert-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Session Management | Unit | Application | Controller | Session Live Alert', function () {
  describe('#dismissLiveAlert', function () {
    it('should call dismissLiveAlert', async function () {
      const sessionId = 123;
      const userId = 456;
      const request = buildRequest(sessionId);
      request.deserializedPayload = { userId };

      sinon.stub(usecases, 'dismissLiveAlert');
      usecases.dismissLiveAlert
        .withArgs({
          sessionId,
          userId,
        })
        .resolves();

      const response = await sessionLiveAlertController.dismissLiveAlert(request, hFake);

      expect(response.statusCode).to.equal(204);
    });
  });
});

function buildRequest(sessionId, userId, firstName, lastName, birthdate) {
  return {
    params: { id: sessionId },
    auth: {
      credentials: {
        userId,
      },
    },
    payload: {
      data: {
        attributes: {
          'first-name': firstName,
          'last-name': lastName,
          birthdate: birthdate,
        },
        type: 'certification-candidates',
      },
    },
  };
}
