import { expect, catchErr, domainBuilder } from '../../../test-helper';
import updateCampaignDetailsManagement from '../../../../lib/domain/usecases/update-campaign-details-management';
import { EntityValidationError } from '../../../../lib/domain/errors';
import campaignValidator from '../../../../lib/domain/validators/campaign-validator';
import sinon from 'sinon';

describe('Unit | UseCase | update-campaign-details-management', function () {
  let campaignManagementRepository;
  let campaign;

  beforeEach(function () {
    campaign = domainBuilder.buildCampaign();

    campaignManagementRepository = {
      update: sinon.stub(),
      get: sinon.stub().resolves(campaign),
    };

    sinon.stub(campaignValidator, 'validate');
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

    await updateCampaignDetailsManagement({ campaignId, ...campaignAttributes, campaignManagementRepository });

    expect(campaignManagementRepository.update).to.have.been.calledOnceWith({ campaignId, campaignAttributes });
  });

  context('when you update campaign but validation is wrong', function () {
    it('should throw an error', async function () {
      const campaignId = campaign.id;
      campaignValidator.validate.throws(new EntityValidationError({ invalidAttributes: [] }));

      const error = await catchErr(updateCampaignDetailsManagement)({
        campaignId,
        campaignManagementRepository,
      });

      expect(error).to.be.an.instanceOf(EntityValidationError);
    });
  });
});
