import { expect, sinon } from '../../../../test-helper';
import randomString from 'randomstring';
import campaignCodeGenerator from '../../../../../lib/domain/services/campaigns/campaign-code-generator';

describe('Unit | Domain | Services | campaign code generator', function () {
  describe('#createCampaignCode', function () {
    const campaignRepository = {
      isCodeAvailable: () => undefined,
    };

    beforeEach(function () {
      sinon.stub(campaignRepository, 'isCodeAvailable');
      campaignRepository.isCodeAvailable.resolves(true);
    });

    it('should create a code with a length of 9 characters', function () {
      // when
      const promise = campaignCodeGenerator.generate(campaignRepository);

      // then
      return promise.then((code) => {
        expect(code.length).to.equal(9);
      });
    });

    it('should create a code beginning with 6 letters', function () {
      // when
      const promise = campaignCodeGenerator.generate(campaignRepository);

      // then
      return promise.then((code) => {
        const codeLetters = code.substring(0, 6);
        expect(codeLetters).to.match(/^[A-Z]+$/);
      });
    });

    it('should create a code finishing with 3 numbers', function () {
      // when
      const promise = campaignCodeGenerator.generate(campaignRepository);

      // then
      return promise.then((code) => {
        const codeNumbers = code.substring(6, 9);
        expect(codeNumbers).to.match(/^[0-9]+$/);
      });
    });

    it('should not be already assigned', function () {
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

    it('should not contains unreadable characters (I, l, 0)', function () {
      sinon.spy(randomString, 'generate');

      // when
      const promise = campaignCodeGenerator.generate(campaignRepository);

      // then
      return promise.then(() => {
        const firstCallArgumentsForLetters = randomString.generate.getCall(0).args[0];
        expect(firstCallArgumentsForLetters.readable).to.be.true;
      });
    });

    it('should not contains unreadable numbers (O)', function () {
      sinon.spy(randomString, 'generate');

      // when
      const promise = campaignCodeGenerator.generate(campaignRepository);

      // then
      return promise.then(() => {
        const secondCallArgumentsForNumbers = randomString.generate.getCall(1).args[0];
        expect(secondCallArgumentsForNumbers.readable).to.be.true;
      });
    });

    it('should returns different campaign code from a given list when batch insert campaigns', function () {
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
