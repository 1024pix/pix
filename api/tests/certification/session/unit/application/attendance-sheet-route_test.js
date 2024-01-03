import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import * as moduleUnderTest from '../../../../../src/certification/session/application/attendance-sheet-route.js';
import { attendanceSheetController } from '../../../../../src/certification/session/application/attendance-sheet-controller.js';
import { authorization } from '../../../../../lib/application/preHandlers/authorization.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';

describe('Unit | Router | attendance-sheet-route', function () {
  describe('GET /api/sessions/{id}/attendance-sheet', function () {
    it('should exist', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').resolves(true);
      sinon.stub(attendanceSheetController, 'getAttendanceSheet').returns('ok');
      const auth = { credentials: { userId: 99 }, strategy: {} };
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/sessions/1/attendance-sheet', {}, auth);

      // then
      expect(response.statusCode).to.equal(200);
    });

    describe('when ID params is out of range for database integer (> 2147483647)', function () {
      it(`should return 400`, async function () {
        // given
        sinon.stub(authorization, 'verifySessionAuthorization').resolves(true);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/sessions/9999999999/attendance-sheet');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    describe('when session ID params is not a number', function () {
      it(`should return 400`, async function () {
        // given
        sinon.stub(authorization, 'verifySessionAuthorization').resolves(true);
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request('GET', '/api/sessions/salut/attendance-sheet');

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    it('should return 404 if the user is not authorized on the session', async function () {
      // given
      sinon.stub(authorization, 'verifySessionAuthorization').throws(new NotFoundError());

      const auth = { credentials: { userId: 99 }, strategy: {} };
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      const response = await httpTestServer.request('GET', '/api/sessions/3/attendance-sheet', {}, auth);

      // then
      expect(response.statusCode).to.equal(404);
    });
  });
});
