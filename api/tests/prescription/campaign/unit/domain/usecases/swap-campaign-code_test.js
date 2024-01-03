import { expect, sinon, catchErr } from '../../../../../test-helper.js';
import { swapCampaignCodes } from '../../../../../../src/prescription/campaign/domain/usecases/swap-campaign-code.js';
import { SwapCampaignMismatchOrganizationError } from '../../../../../../src/prescription/campaign/domain/errors.js';

describe('Unit | UseCase | swap-campaign-code', function () {
  let campaignAdministrationRepository;

  beforeEach(function () {
    campaignAdministrationRepository = { swapCampaignCodes: sinon.stub(), isFromSameOrganization: sinon.stub() };
  });

  it('should swap the codes', async function () {
    // given
    const firstCampaignId = Symbol('FIRST_ID');
    const secondCampaignId = Symbol('SECOND_ID');

    campaignAdministrationRepository.isFromSameOrganization
      .withArgs({ firstCampaignId, secondCampaignId })
      .resolves(true);
    campaignAdministrationRepository.swapCampaignCodes.withArgs({ firstCampaignId, secondCampaignId }).resolves();

    // when
    await swapCampaignCodes({
      firstCampaignId,
      secondCampaignId,
      campaignAdministrationRepository,
    });

    // then
    expect(campaignAdministrationRepository.swapCampaignCodes).to.have.been.calledWithExactly({
      firstCampaignId,
      secondCampaignId,
    });
  });

  it('should throw SwapCampaignMismatchOrganizationError on campaign from different organization', async function () {
    const firstCampaignId = Symbol('FIRST_ID');
    const secondCampaignId = Symbol('SECOND_ID');

    campaignAdministrationRepository.isFromSameOrganization
      .withArgs({ firstCampaignId, secondCampaignId })
      .resolves(false);
    campaignAdministrationRepository.swapCampaignCodes.withArgs({ firstCampaignId, secondCampaignId }).throws();

    // when
    const error = await catchErr(swapCampaignCodes)({
      firstCampaignId,
      secondCampaignId,
      campaignAdministrationRepository,
    });

    expect(error).to.be.an.instanceOf(SwapCampaignMismatchOrganizationError);
  });
});
