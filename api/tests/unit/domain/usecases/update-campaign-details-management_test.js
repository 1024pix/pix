import { expect, catchErr, domainBuilder, sinon } from '../../../test-helper.js';
import { updateCampaignDetailsManagement } from '../../../../lib/domain/usecases/update-campaign-details-management.js';
import { EntityValidationError } from '../../../../src/shared/domain/errors.js';

describe('Unit | UseCase | update-campaign-details-management', function () {
  let campaignManagementRepository;
  let campaign;
  let campaignValidator;

  beforeEach(function () {
    campaign = domainBuilder.buildCampaign();

    campaignManagementRepository = {
      update: sinon.stub(),
      get: sinon.stub().resolves(campaign),
    };

    campaignValidator = { validate: sinon.stub() };
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

    await updateCampaignDetailsManagement({
      campaignId,
      ...campaignAttributes,
      campaignManagementRepository,
      campaignValidator,
    });

    expect(campaignManagementRepository.update).to.have.been.calledOnceWith({ campaignId, campaignAttributes });
  });

  context('when you update campaign but validation is wrong', function () {
    it('should throw an error', async function () {
      const campaignId = campaign.id;
      campaignValidator.validate.throws(new EntityValidationError({ invalidAttributes: [] }));

      const error = await catchErr(updateCampaignDetailsManagement)({
        campaignId,
        campaignManagementRepository,
        campaignValidator,
      });

      expect(error).to.be.an.instanceOf(EntityValidationError);
    });
  });
});
