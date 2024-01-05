import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';
import { usecases } from '../../../../../src/certification/shared/domain/usecases/index.js';
import { invigilatorKitController } from '../../../../../src/certification/session/application/invigilator-kit-controller.js';
import { getI18n } from '../../../../tooling/i18n/i18n.js';
import { LANG } from '../../../../../src/shared/domain/constants.js';

describe('Unit | Controller | invigilator-kit-controller', function () {
  describe('#getInvigilatorKitPdf', function () {
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    /* eslint-disable mocha/no-setup-in-describe */
    [
      { lang: LANG.ENGLISH, filename: 'invigilator-kit-1.pdf' },
      { lang: LANG.FRENCH, filename: 'kit-surveillant-1.pdf' },
    ].forEach(function ({ lang, filename }) {
      /* eslint-enable mocha/no-setup-in-describe */
      it(`should return invigilator kit in ${lang}`, async function () {
        // given
        sinon.stub(usecases, 'getInvigilatorKitSessionInfo');
        const sessionMainInfo = domainBuilder.buildSessionForInvigilatorKit({ id: 1 });
        const invigilatorKitBuffer = 'binary string';
        const userId = 1;
        const i18n = getI18n();
        const request = {
          i18n,
          auth: { credentials: { userId } },
          params: { id: sessionMainInfo.id },
        };
        i18n.setLocale(lang);

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
