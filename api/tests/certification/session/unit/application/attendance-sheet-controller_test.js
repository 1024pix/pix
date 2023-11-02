import { expect, hFake, sinon } from '../../../../test-helper.js';
import { usecases } from '../../../../../src/certification/shared/domain/usecases/index.js';
import { attendanceSheetController } from '../../../../../src/certification/session/application/attendance-sheet-controller.js';
import { getI18n } from '../../../../tooling/i18n/i18n.js';

describe('Unit | Controller | attendance-sheet-controller', function () {
  describe('#getAttendanceSheet', function () {
    it('should return the attendance sheet in pdf format', async function () {
      // given
      const i18n = getI18n();
      const sessionId = 1;
      const userId = 1;
      const fileName = `feuille-emargement-session-${sessionId}.pdf`;
      const attendanceSheet = Buffer.alloc(5);
      const accessToken = 'ABC123';

      const tokenService = {
        extractUserId: sinon.stub(),
      };
      sinon.stub(usecases, 'getAttendanceSheet');
      const request = {
        i18n,
        params: { id: sessionId },
        payload: {},
        query: {
          accessToken,
        },
      };

      tokenService.extractUserId.withArgs(accessToken).returns(userId);
      usecases.getAttendanceSheet.withArgs({ sessionId, userId, i18n }).resolves({
        fileName,
        attendanceSheet,
      });

      // when
      const response = await attendanceSheetController.getAttendanceSheet(request, hFake, { tokenService });

      // then
      const expectedHeaders = {
        'Content-Disposition': `attachment; filename=feuille-emargement-session-${sessionId}.pdf`,
        'Content-Type': 'application/pdf',
      };
      expect(response.headers).to.deep.equal(expectedHeaders);
    });
  });
});
