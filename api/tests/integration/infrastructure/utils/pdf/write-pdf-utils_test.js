const { expect } = require('../../../../test-helper');

const { getPdfBuffer } = require('../../../../../lib/infrastructure/utils/pdf/write-pdf-utils');

describe('Integration | Infrastructure | Utils | Pdf | write-Pdf-utils', function() {

  describe('getPdfBuffer', function() {

    it('should return the pdf file as a buffer', async function() {
      // given
      const templateFileName = 'attestation-pix-vierge-clea.pdf';

      //For now we can't compare to a target file's buffer due to pdf-lib wich is non deterministic
      //And should be fixed by this PR (https://github.com/Hopding/pdf-lib/pull/574)

      // when
      const result = await getPdfBuffer({
        templatePath: `${__dirname}/files`,
        templateFileName,
        applyDynamicInformationsInPDF: () => {},
        data: {},
      });

      // then
      expect(result).to.be.instanceOf(Buffer);
    });
  });
});
