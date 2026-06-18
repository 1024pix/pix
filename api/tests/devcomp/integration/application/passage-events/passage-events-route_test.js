import { passageEventRoute as moduleUnderTest } from '../../../../../src/devcomp/application/passage-events/passage-event-route.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Integration | Devcomp | Application | Module | Router | passage-events-router', function () {
  describe('POST /api/passage-events', function () {
    context('when payload is empty', function () {
      it('should return a 400 HTTP code error', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const invalidPayload = {};

        // when
        const response = await httpTestServer.request('POST', '/api/passage-events', invalidPayload);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when payload does not pass validation', function () {
      it('should return a 400 HTTP code error', async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const invalidPayload = {
          data: {
            attributes: {
              'passage-events': [],
            },
          },
        };

        // when
        const response = await httpTestServer.request('POST', '/api/passage-events', invalidPayload);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
