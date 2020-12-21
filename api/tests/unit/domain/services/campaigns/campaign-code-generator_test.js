const { expect, sinon } = require('../../../../test-helper');
const randomString = require('randomstring');
const campaignCodeGenerator = require('../../../../../lib/domain/services/campaigns/campaign-code-generator');

describe('Unit | Domain | Services | campaign code generator', function() {

  describe('#createCampaignCode', () => {

    const campaignRepository = {
      isCodeAvailable: () => undefined,
    };

    beforeEach(() => {
      sinon.stub(campaignRepository, 'isCodeAvailable');
      campaignRepository.isCodeAvailable.resolves(true);
    });

    it('should create a code with a length of 9 characters', () => {
      // when
      const promise = campaignCodeGenerator.generate(campaignRepository);

      // then
      return promise.then((code) => {
        expect(code.length).to.equal(9);
      });
    });

    it('should create a code beginning with 6 letters', () => {
      // when
      const promise = campaignCodeGenerator.generate(campaignRepository);

      // then
      return promise.then((code) => {
        const codeLetters = code.substring(0, 6);
        expect(codeLetters).to.match(/^[A-Z]+$/);
      });
    });

    it('should create a code finishing with 3 numbers', () => {
      // when
      const promise = campaignCodeGenerator.generate(campaignRepository);

      // then
      return promise.then((code) => {
        const codeNumbers = code.substring(6, 9);
        expect(codeNumbers).to.match(/^[0-9]+$/);
      });
    });

    it('should not be already assigned', () => {
      // given
      campaignRepository.isCodeAvailable.onCall(0).resolves(false);
      campaignRepository.isCodeAvailable.onCall(1).resolves(true);

      // when
      const promise = campaignCodeGenerator.generate(campaignRepository);

      // then
      return promise.then((generatedCode) => {
        expect(campaignRepository.isCodeAvailable).to.have.been.called;

        const existingCampaignCode = campaignRepository.isCodeAvailable.callsArg(0);
        expect(generatedCode).to.not.equal(existingCampaignCode);
      });

    });

    it('should not contains unreadable characters (I, l, 0)', () => {
      sinon.spy(randomString, 'generate');

      // when
      const promise = campaignCodeGenerator.generate(campaignRepository);

      // then
      return promise.then(() => {
        const firstCallArgumentsForLetters = randomString.generate.getCall(0).args[0];
        expect(firstCallArgumentsForLetters.readable).to.be.true;
      });
    });

    it('should not contains unreadable numbers (O)', () => {
      sinon.spy(randomString, 'generate');

      // when
      const promise = campaignCodeGenerator.generate(campaignRepository);

      // then
      return promise.then(() => {
        const secondCallArgumentsForNumbers = randomString.generate.getCall(1).args[0];
        expect(secondCallArgumentsForNumbers.readable).to.be.true;
      });
    });

    it('should returns different campaign code from a given list when batch insert campaigns', () => {
      sinon.stub(randomString, 'generate');

      const pendingCodeNumbers = '345';
      const pendingCodeLetters = 'AZERTY';

      const pendingCode = pendingCodeLetters.concat(pendingCodeNumbers);

      // given
      randomString.generate.onCall(0).returns(pendingCodeLetters);
      randomString.generate.onCall(1).returns(pendingCodeNumbers);

      randomString.generate.onCall(2).returns('YTREZA');
      randomString.generate.onCall(3).returns('543');

      // when
      const promise = campaignCodeGenerator.generate(campaignRepository, [pendingCode]);

      // then
      return promise.then((generatedCode) => {
        expect(generatedCode).to.not.equal(pendingCode);
        expect(generatedCode).to.equal('YTREZA543');
      });
    });
  });
});
