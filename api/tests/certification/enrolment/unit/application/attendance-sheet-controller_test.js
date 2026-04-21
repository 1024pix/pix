import sinon from 'sinon';

import { attendanceSheetController } from '../../../../../src/certification/enrolment/application/attendance-sheet-controller.js';
import { usecases } from '../../../../../src/certification/enrolment/domain/usecases/index.js';
import { getI18nFromRequest } from '../../../../../src/shared/infrastructure/i18n/i18n.js';

import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Controller | attendance-sheet-controller', function () {
  describe('#getAttendanceSheet', function () {
    it('should return the attendance sheet in pdf format', async function () {
      // given
      const sessionId = 1;
      const userId = 1;
      const fileName = `feuille-emargement-session-${sessionId}.pdf`;
      const attendanceSheet = Buffer.alloc(5);

      const request = {
        params: { sessionId },
        payload: {},
        auth: { credentials: { userId } },
      };
      const i18n = getI18nFromRequest(request);

      sinon.stub(usecases, 'getAttendanceSheet');
      usecases.getAttendanceSheet.withArgs({ sessionId, userId, i18n }).resolves({
        fileName,
        attendanceSheet,
      });

      // when
      const response = await attendanceSheetController.getAttendanceSheet(request, hFake);

      // then
      const expectedHeaders = {
        'Content-Disposition': `attachment; filename=feuille-emargement-session-${sessionId}.pdf`,
        'Content-Type': 'application/pdf',
      };
      expect(response.headers).to.deep.equal(expectedHeaders);
    });
  });
});
