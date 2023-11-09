import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';
import { usecases } from '../../../../../src/certification/shared/domain/usecases/index.js';
import { invigilatorKitController } from '../../../../../src/certification/session/application/invigilator-kit-controller.js';

describe('Unit | Controller | invigilator-kit-controller', function () {
  describe('#getInvigilatorKitPdf', function () {
    it('should return invigilator kit', async function () {
      // given
      sinon.stub(usecases, 'getInvigilatorKitSessionInfo');
      const sessionMainInfo = domainBuilder.buildSessionForInvigilatorKit({ id: 1 });
      const invigilatorKitBuffer = 'binary string';
      const userId = 1;
      const request = {
        auth: { credentials: { userId } },
        params: { id: sessionMainInfo.id },
        query: {
          accessToken: 'ACCESS_TOKEN',
        },
      };
      const tokenService = {
        extractUserId: sinon.stub(),
      };
      const requestResponseUtils = {
        extractLocaleFromRequest: sinon.stub(),
      };
      tokenService.extractUserId.withArgs(request.query.accessToken).returns(userId);
      const invigilatorKitPdf = {
        getInvigilatorKitPdfBuffer: sinon.stub(),
      };
      invigilatorKitPdf.getInvigilatorKitPdfBuffer.resolves({
        buffer: invigilatorKitBuffer,
        fileName: `kit-surveillant-${sessionMainInfo.id}.pdf`,
      });
      usecases.getInvigilatorKitSessionInfo.resolves(sessionMainInfo);

      // when
      const response = await invigilatorKitController.getInvigilatorKitPdf(request, hFake, {
        tokenService,
        requestResponseUtils,
        invigilatorKitPdf,
      });

      // then
      expect(usecases.getInvigilatorKitSessionInfo).to.have.been.calledWithExactly({
        userId,
        sessionId: sessionMainInfo.id,
      });
      expect(response.source).to.deep.equal(invigilatorKitBuffer);
      expect(response.headers['Content-Disposition']).to.contains(`attachment; filename=kit-surveillant-1.pdf`);
    });
  });
});
