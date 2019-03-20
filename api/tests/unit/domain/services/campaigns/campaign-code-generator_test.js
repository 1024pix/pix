const { expect, sinon } = require('../../../../test-helper');
const randomString = require('randomstring');
const campaignCodeGenerator = require('../../../../../lib/domain/services/campaigns/campaign-code-generator');
const { NotFoundError } = require('../../../../../lib/domain/errors');

describe('Unit | Domain | Services | campaign code generator', function() {

  describe('#createCampaignCode', () => {

    let campaignRepository;

    beforeEach(() => {
      campaignRepository = {
        getByCode: sinon.stub()
      };
      campaignRepository.getByCode.rejects(new NotFoundError);
      sinon.spy(randomString, 'generate');
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

    it('should not be already assigned', async () => {
      // given
      campaignRepository.getByCode.onCall(0).resolves();

      // when
      const promise = campaignCodeGenerator.generate(campaignRepository);

      // then
      return promise.then((generatedCode) => {
        const existingCampaignCode = campaignRepository.getByCode.callsArg(0);
        expect(generatedCode).to.not.equal(existingCampaignCode);
      });

    });

    it('should not contains unreadable characters (I, l, 0)', () => {
      // when
      const promise = campaignCodeGenerator.generate(campaignRepository);

      // then
      return promise.then(() => {
        const firstCallArgumentsForLetters = randomString.generate.getCall(0).args[0];
        expect(firstCallArgumentsForLetters.hasOwnProperty('readable')).to.be.true;
      });
    });

    it('should not contains unreadable numbers (O)', () => {
      // when
      const promise = campaignCodeGenerator.generate(campaignRepository);

      // then
      return promise.then(() => {
        const secondCallArgumentsForNumbers = randomString.generate.getCall(1).args[0];
        expect(secondCallArgumentsForNumbers.hasOwnProperty('readable')).to.be.true;
      });
    });

    it('should throw an error', () => {
      // given
      campaignRepository.getByCode.rejects();

      // when
      const promise = campaignCodeGenerator.generate(campaignRepository);

      // then
      return expect(promise).to.be.rejected;
    });

  });
});
