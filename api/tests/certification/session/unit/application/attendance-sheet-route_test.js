import { expect, HttpTestServer, sinon } from '../../../../test-helper.js';
import * as moduleUnderTest from '../../../../../src/certification/session/application/attendance-sheet-route.js';
import { attendanceSheetController } from '../../../../../src/certification/session/application/attendance-sheet-controller.js';

describe('Unit | Router | attendance-sheet-route', function () {
  describe('GET /api/sessions/{id}/attendance-sheet', function () {
    it('should exist', async function () {
      // given
      sinon.stub(attendanceSheetController, 'getAttendanceSheet').returns('ok');
      const httpTestServer = new HttpTestServer();
      await httpTestServer.register(moduleUnderTest);

      // when
      const response = await httpTestServer.request('GET', '/api/sessions/1/attendance-sheet?accessToken=toto&lang=fr');

      // then
      expect(response.statusCode).to.equal(200);
    });

    describe('when ID params is out of range for database integer (> 2147483647)', function () {
      it(`should return 400`, async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(
          'GET',
          '/api/sessions/9999999999/attendance-sheet?accessToken=toto&lang=fr',
        );

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    describe('when session ID params is not a number', function () {
      it(`should return 400`, async function () {
        // given
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        // when
        const response = await httpTestServer.request(
          'GET',
          '/api/sessions/salut/attendance-sheet?accessToken=toto&lang=fr',
        );

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
