import sinon from 'sinon';

import { generate } from '../../../../../src/shared/domain/services/access-code-generator.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | Services | code generator', function () {
  describe('#createCode', function () {
    const accessCodeRepository = {
      isCodeAvailable: () => undefined,
    };

    beforeEach(function () {
      sinon.stub(accessCodeRepository, 'isCodeAvailable');
      accessCodeRepository.isCodeAvailable.resolves(true);
    });

    it('should create a code with a length of 9 characters', async function () {
      // given
      const generateCode = sinon.stub();
      generateCode.onFirstCall().returns('abcdef');
      generateCode.onSecondCall().returns('123');

      // when
      const code = await generate(accessCodeRepository, [], { generateCode });

      // then
      expect(code).to.have.lengthOf(9);
    });

    it('should create a code beginning with 6 letters and finishing with 3 numbers', async function () {
      // given
      const generateCode = sinon.stub();
      generateCode.onFirstCall().returns('abcdef');
      generateCode.onSecondCall().returns('123');

      // when
      await generate(accessCodeRepository, [], { generateCode });

      // then
      expect(generateCode).to.have.been.calledWith(6, 'alphaSafe');
      expect(generateCode).to.have.been.calledWith(3, 'numericSafe');
    });

    it('should not be already assigned', async function () {
      // given
      const generateCode = sinon.stub();
      generateCode.onFirstCall().returns('abcdef');
      generateCode.onSecondCall().returns('123');
      generateCode.onThirdCall().returns('ghijkl');
      generateCode.onCall(3).returns('456');

      accessCodeRepository.isCodeAvailable.onCall(0).resolves(false);
      accessCodeRepository.isCodeAvailable.onCall(1).resolves(true);

      // when
      const generatedCode = await generate(accessCodeRepository, [], { generateCode });

      // then
      expect(accessCodeRepository.isCodeAvailable).to.have.been.called;
      expect(generatedCode).to.equal('GHIJKL456');
    });

    it('should returns different campaign code from a given list when batch insert campaigns', async function () {
      // given
      const pendingCodeNumbers = '345';
      const pendingCodeLetters = 'AZERTY';

      const pendingCode = pendingCodeLetters.concat(pendingCodeNumbers);

      const generateCode = sinon.stub();
      generateCode.onCall(0).returns(pendingCodeLetters);
      generateCode.onCall(1).returns(pendingCodeNumbers);
      generateCode.onCall(2).returns('YTREZA');
      generateCode.onCall(3).returns('543');

      // when
      const generatedCode = await generate(accessCodeRepository, [pendingCode], { generateCode });

      // then
      expect(generatedCode).to.not.equal(pendingCode);
      expect(generatedCode).to.equal('YTREZA543');
    });
  });
});
