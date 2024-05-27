import { superviseController } from '../../../../../src/certification/session-management/application/supervise-controller.js';
import * as moduleUnderTest from '../../../../../src/certification/session-management/application/supervise-route.js';
import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Certification | session-management | supervise | Routes', function () {
  describe('POST /api/sessions/{id}/supervise', function () {
    it('should return 200', async function () {
      //given
      sinon.stub(superviseController, 'supervise').returns('ok');

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = {
        data: {
          id: '1234',
          type: 'supervisor-authentications',
          attributes: {
            'session-id': '121',
            'supervisor-password': 'XXX',
          },
        },
      };

      // when
      const response = await httpTestServer.request('POST', '/api/sessions/supervise', payload);

      // then
      expect(response.statusCode).to.equal(200);
    });

    describe('when there are missing attributes', function () {
      it('should return 422', async function () {
        //given
        sinon.stub(superviseController, 'supervise').returns('ok');

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const payload = {
          data: {
            id: '1234',
            type: 'supervisor-authentications',
            attributes: {
              'session-id': '121',
            },
          },
        };

        // when
        const response = await httpTestServer.request('POST', '/api/sessions/supervise', payload);

        // then
        expect(response.statusCode).to.equal(422);
      });
    });
  });
});
