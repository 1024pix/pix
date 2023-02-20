import { expect, sinon, catchErr } from '../../../test-helper';
import { NotFoundError, UserNotAuthorizedToAccessEntityError } from '../../../../lib/domain/errors';
import CampaignReport from '../../../../lib/domain/read-models/CampaignReport';
import getCampaign from '../../../../lib/domain/usecases/get-campaign';

describe('Unit | UseCase | get-campaign', function () {
  let userId, campaignId, campaign, stages, badges, masteryRates;
  let campaignRepository;
  let campaignReportRepository;
  let badgeRepository;

  beforeEach(function () {
    badges = Symbol('badges');
    stages = Symbol('stages');
    masteryRates = Symbol('masteryRates');

    campaignId = 1;
    userId = 1;
    campaign = new CampaignReport({
      id: campaignId,
      name: 'My campaign',
      type: 'ASSESSMENT',
    });

    badgeRepository = {
      findByCampaignId: sinon.stub(),
    };
    campaignRepository = {
      checkIfUserOrganizationHasAccessToCampaign: sinon.stub(),
      findStages: sinon.stub(),
    };
    campaignReportRepository = {
      get: sinon.stub(),
      findMasteryRates: sinon.stub(),
    };

    badgeRepository.findByCampaignId.resolves(badges);
    campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(true);
    campaignReportRepository.get.resolves(campaign);
    campaignReportRepository.findMasteryRates.resolves(masteryRates);
    campaignRepository.findStages.resolves(stages);
    sinon.stub(CampaignReport.prototype, 'computeAverageResult');
  });

  it('should get the campaign', async function () {
    // when
    const resultCampaign = await getCampaign({
      campaignId,
      userId,
      badgeRepository,
      campaignRepository,
      campaignReportRepository,
    });

    // then
    expect(resultCampaign.name).to.equal(campaign.name);
    expect(campaignRepository.checkIfUserOrganizationHasAccessToCampaign).calledWith(campaignId, userId);
  });

  it('should get campaign stages', async function () {
    // when
    const resultCampaign = await getCampaign({
      campaignId,
      userId,
      badgeRepository,
      campaignRepository,
      campaignReportRepository,
    });

    // then
    expect(resultCampaign.stages).to.equal(stages);
  });

  it('should get campaign badges', async function () {
    // when
    const resultCampaign = await getCampaign({
      campaignId,
      userId,
      badgeRepository,
      campaignRepository,
      campaignReportRepository,
    });

    // then
    expect(resultCampaign.badges).to.equal(badges);
  });

  it('should compute average results if campaign type is assessment', async function () {
    // when
    await getCampaign({
      campaignId,
      userId,
      badgeRepository,
      campaignRepository,
      campaignReportRepository,
    });

    // then
    sinon.assert.calledWithExactly(CampaignReport.prototype.computeAverageResult, masteryRates);
  });

  it('should not compute average results if campaign type is profiles collection', async function () {
    const profilesCollectionCampaign = new CampaignReport({
      id: 999,
      type: 'PROFILES_COLLECTION',
    });
    campaignReportRepository.get.resolves(profilesCollectionCampaign);

    // when
    await getCampaign({
      campaignId: profilesCollectionCampaign.id,
      userId,
      badgeRepository,
      campaignRepository,
      campaignReportRepository,
    });

    // then
    sinon.assert.notCalled(CampaignReport.prototype.computeAverageResult);
  });

  it('should throw a Not found error when the campaign is searched with a not valid ID', async function () {
    // when
    const error = await catchErr(getCampaign)({
      campaignId: 'invalid Campaign Id',
      userId,
      badgeRepository,
      campaignRepository,
      campaignReportRepository,
    });

    // then
    expect(error).to.be.instanceOf(NotFoundError);
  });

  it("should throw UserNotAuthorizedToAccessEntityError when user does not belong to organization's campaign", async function () {
    // given
    campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(false);

    // when
    const error = await catchErr(getCampaign)({
      campaignId,
      userId,
      badgeRepository,
      campaignRepository,
      campaignReportRepository,
    });

    // then
    return expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
  });
});
