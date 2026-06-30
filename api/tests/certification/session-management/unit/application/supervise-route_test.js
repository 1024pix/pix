import sinon from 'sinon';

import { superviseController } from '../../../../../src/certification/session-management/application/supervise-controller.js';
import { superviseRoute as moduleUnderTest } from '../../../../../src/certification/session-management/application/supervise-route.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Certification | Session Management | Unit | Application | Routes | Supervise', function () {
  describe('POST /api/sessions/{id}/supervise', function () {
    it('should return 200', async function () {
      //given
      sinon.stub(superviseController, 'supervise').returns('ok');

      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);
      const payload = {
        data: {
          id: '121',
          type: 'invigilator-authentications',
          attributes: {
            'session-id': '121',
            'invigilator-password': 'XXX',
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
            id: '121',
            type: 'invigilator-authentications',
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
