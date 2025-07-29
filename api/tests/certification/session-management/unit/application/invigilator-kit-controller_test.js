import { invigilatorKitController } from '../../../../../src/certification/session-management/application/invigilator-kit-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { getI18n } from '../../../../../src/shared/infrastructure/i18n/i18n.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Session Management | Unit | Application | Controller | Invigilator Kit', function () {
  describe('#getInvigilatorKitPdf', function () {
    [
      { lang: 'en', filename: 'invigilator-kit-1.pdf' },
      { lang: 'fr', filename: 'kit-surveillant-1.pdf' },
    ].forEach(function ({ lang, filename }) {
      it(`should return invigilator kit in ${lang}`, async function () {
        // given
        sinon.stub(usecases, 'getInvigilatorKitSessionInfo');
        const sessionMainInfo = domainBuilder.certification.sessionManagement.buildSession({ id: 1 });
        const invigilatorKitBuffer = 'binary string';
        const userId = 1;
        const i18n = getI18n(lang);
        const request = {
          i18n,
          auth: { credentials: { userId } },
          params: { sessionId: sessionMainInfo.id },
        };

        const invigilatorKitPdf = {
          getInvigilatorKitPdfBuffer: sinon.stub(),
        };

        usecases.getInvigilatorKitSessionInfo.resolves(sessionMainInfo);
        invigilatorKitPdf.getInvigilatorKitPdfBuffer
          .withArgs({ sessionForInvigilatorKit: sessionMainInfo, lang })
          .resolves({
            buffer: invigilatorKitBuffer,
            fileName: filename,
          });

        // when
        const response = await invigilatorKitController.getInvigilatorKitPdf(request, hFake, {
          invigilatorKitPdf,
        });

        // then
        expect(usecases.getInvigilatorKitSessionInfo).to.have.been.calledWithExactly({
          userId,
          sessionId: sessionMainInfo.id,
        });
        expect(response.source).to.deep.equal(invigilatorKitBuffer);
        expect(response.headers['Content-Disposition']).to.contains(`attachment; filename=${filename}`);
      });
    });
  });
});
