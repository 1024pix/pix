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
        headers: {
          'accept-language': 'fr',
        },
        auth: { credentials: { userId } },
        params: { id: sessionMainInfo.id },
      };
      const requestResponseUtils = {
        extractLocaleFromRequest: sinon.stub(),
      };
      const invigilatorKitPdf = {
        getInvigilatorKitPdfBuffer: sinon.stub(),
      };

      requestResponseUtils.extractLocaleFromRequest.withArgs(request.headers['accept-language']).resolves('fr');
      usecases.getInvigilatorKitSessionInfo.resolves(sessionMainInfo);
      invigilatorKitPdf.getInvigilatorKitPdfBuffer.resolves({
        buffer: invigilatorKitBuffer,
        fileName: `kit-surveillant-${sessionMainInfo.id}.pdf`,
      });

      // when
      const response = await invigilatorKitController.getInvigilatorKitPdf(request, hFake, {
        invigilatorKitPdf,
        requestResponseUtils,
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
