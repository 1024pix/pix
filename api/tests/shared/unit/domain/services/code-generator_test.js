import sinon from 'sinon';

import { generateAvailableAccessCode } from '../../../../../src/shared/domain/services/access-code-generator.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | Services | access code generator', function () {
  describe('generateAvailableAccessCode', function () {
    it('generates an access code beginning with 6 letters and finishing with 3 numbers', async function () {
      // given
      const generateCode = sinon.stub();
      generateCode.onFirstCall().returns('abcdef');
      generateCode.onSecondCall().returns('123');

      // when
      const code = await generateAvailableAccessCode(() => true, { generateCode });

      // then
      expect(generateCode).to.have.been.calledWith(6, 'alphaSafe');
      expect(generateCode).to.have.been.calledWith(3, 'numericSafe');
      expect(code).to.equal('ABCDEF123');
    });

    it('checks the availability of the generated code', async function () {
      // given
      const generateCode = sinon.stub();
      generateCode.onFirstCall().returns('abcdef');
      generateCode.onSecondCall().returns('123');
      generateCode.onThirdCall().returns('ghijkl');
      generateCode.onCall(3).returns('456');

      const availabilityCallback = (code) => {
        return code === 'GHIJKL456';
      };

      // when
      const generatedCode = await generateAvailableAccessCode(availabilityCallback, { generateCode });

      // then
      expect(generatedCode).to.equal('GHIJKL456');
    });
  });
});
