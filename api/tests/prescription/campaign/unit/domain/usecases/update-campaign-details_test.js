import { expect, catchErr, domainBuilder, sinon } from '../../../../../test-helper.js';
import { updateCampaignDetails } from '../../../../../../src/prescription/campaign/domain/usecases/update-campaign-details.js';
import { EntityValidationError } from '../../../../../../src/shared/domain/errors.js';

describe('Unit | UseCase | update-campaign-details', function () {
  let campaignAdministrationRepository, campaignManagementRepository;
  let campaign;
  let campaignUpdateValidator;

  beforeEach(function () {
    campaign = domainBuilder.buildCampaign();

    campaignAdministrationRepository = {
      updateByCampaignId: sinon.stub(),
      get: sinon.stub().resolves(campaign),
    };

    campaignManagementRepository = {
      get: sinon.stub().resolves(campaign),
    };

    campaignUpdateValidator = { validate: sinon.stub() };
  });

  it('should update the campaign', async function () {
    const campaignId = campaign.id;
    const campaignAttributes = {
      name: 'new Name',
      title: 'new title',
      customLandingPageText: 'new landing text',
      customResultPageText: 'new result text',
      customResultPageButtonText: 'new result button text',
      customResultPageButtonUrl: 'new result button url',
      multipleSendings: false,
    };

    await updateCampaignDetails({
      campaignId,
      ...campaignAttributes,
      campaignAdministrationRepository,
      campaignManagementRepository,
      campaignUpdateValidator,
    });

    expect(campaignAdministrationRepository.updateByCampaignId).to.have.been.calledOnceWith({
      campaignId,
      campaignAttributes,
    });
  });

  context('when you update campaign but validation is wrong', function () {
    it('should throw an error', async function () {
      const campaignId = campaign.id;
      campaignUpdateValidator.validate.throws(new EntityValidationError({ invalidAttributes: [] }));

      const error = await catchErr(updateCampaignDetails)({
        campaignId,
        campaignAdministrationRepository,
        campaignManagementRepository,
        campaignUpdateValidator,
      });

      expect(error).to.be.an.instanceOf(EntityValidationError);
    });
  });
});
