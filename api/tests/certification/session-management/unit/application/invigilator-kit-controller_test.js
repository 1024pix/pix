import { invigilatorKitController } from '../../../../../src/certification/session-management/application/invigilator-kit-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { LANGUAGES_CODE } from '../../../../../src/shared/domain/services/language-service.js';
import { getI18n } from '../../../../../src/shared/infrastructure/i18n/i18n.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Session Management | Unit | Application | Controller | Invigilator Kit', function () {
  describe('#getInvigilatorKitPdf', function () {
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    /* eslint-disable mocha/no-setup-in-describe */
    [
      { lang: LANGUAGES_CODE.ENGLISH, filename: 'invigilator-kit-1.pdf' },
      { lang: LANGUAGES_CODE.FRENCH, filename: 'kit-surveillant-1.pdf' },
    ].forEach(function ({ lang, filename }) {
      /* eslint-enable mocha/no-setup-in-describe */
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
