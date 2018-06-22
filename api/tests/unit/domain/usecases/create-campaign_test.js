const { expect, sinon, factory } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const campaignCodeGenerator = require('../../../../lib/domain/services/campaigns/campaign-code-generator');
const campaignValidator = require('../../../../lib/domain/validators/campaign-validator');
const { EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | create-campaign', () => {

  const availableCampaignCode = 'ABCDEF123';
  const campaignToCreate = factory.buildCampaign({ id: '', code: '' });
  const savedCampaign = factory.buildCampaign({ code: availableCampaignCode });
  const campaignRepository = {
    save: () => undefined,
  };

  beforeEach(() => {
    sinon.stub(campaignCodeGenerator, 'generate');
    sinon.stub(campaignRepository, 'save');
    sinon.stub(campaignValidator, 'validate');
  });

  afterEach(() => {
    campaignCodeGenerator.generate.restore();
    campaignRepository.save.restore();
    campaignValidator.validate.restore();
  });

  it('should throw an EntityValidationError if campaign is not valid', () => {
    // given
    campaignValidator.validate.rejects(new EntityValidationError({ invalidAttributes: [] }));

    // when
    const promise = usecases.createCampaign({ campaign: campaignToCreate, campaignRepository });

    // then
    return expect(promise).to.be.rejectedWith(EntityValidationError);
  });

  it('should generate a new code to the campaign', () => {
    // given
    campaignCodeGenerator.generate.resolves(availableCampaignCode);
    campaignRepository.save.resolves(savedCampaign);
    campaignValidator.validate.resolves();

    // when
    const promise = usecases.createCampaign({ campaign: campaignToCreate, campaignRepository });

    // then
    return promise.then(() => {
      expect(campaignCodeGenerator.generate).to.have.been.called;
    });

  });

  it('should save the campaign with name, userId, organizationId and generated code', () => {
    // given
    campaignCodeGenerator.generate.resolves(availableCampaignCode);
    campaignRepository.save.resolves(savedCampaign);
    campaignValidator.validate.resolves();

    // when
    const promise = usecases.createCampaign({ campaign: campaignToCreate, campaignRepository });

    // then
    return promise.then(() => {
      expect(campaignRepository.save).to.have.been.called;

      const campaignToCreateWithCode = campaignRepository.save.firstCall.args[0];
      expect(campaignToCreateWithCode.name).to.equal(campaignToCreate.name);
      expect(campaignToCreateWithCode.code).to.equal(availableCampaignCode);
      expect(campaignToCreateWithCode.userId).to.equal(campaignToCreate.userId);
      expect(campaignToCreateWithCode.organizationId).to.equal(campaignToCreate.organizationId);
    });
  });

  it('should return the newly created campaign', () => {
    // given
    campaignCodeGenerator.generate.resolves(availableCampaignCode);
    campaignRepository.save.resolves(savedCampaign);
    campaignValidator.validate.resolves();

    // when
    const promise = usecases.createCampaign({ campaign: campaignToCreate, campaignRepository });

    // then
    return promise.then((campaign) => {
      expect(campaign).to.deep.equal(savedCampaign);
    });
  });

});
