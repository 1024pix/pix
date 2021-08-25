const { expect, sinon, catchErr } = require('../../../test-helper');
const {
  NotFoundError,
  UserNotAuthorizedToAccessEntityError,
} = require('../../../../lib/domain/errors');
const CampaignReport = require('../../../../lib/domain/read-models/CampaignReport');
const getCampaign = require('../../../../lib/domain/usecases/get-campaign');

describe('Unit | UseCase | get-campaign', function() {

  let userId, campaignId, campaign, stages, badges, masteryPercentages;
  let campaignRepository;
  let campaignReportRepository;
  let stageRepository;
  let badgeRepository;

  beforeEach(function() {
    badges = Symbol('badges');
    stages = Symbol('stages');
    masteryPercentages = Symbol('masteryPercentages');

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
    };
    campaignReportRepository = {
      get: sinon.stub(),
      findMasteryPercentages: sinon.stub(),
    };
    stageRepository = {
      findByCampaignId: sinon.stub(),
    };

    badgeRepository.findByCampaignId.resolves(badges);
    campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(true);
    campaignReportRepository.get.resolves(campaign);
    campaignReportRepository.findMasteryPercentages.resolves(masteryPercentages);
    stageRepository.findByCampaignId.resolves(stages);
    sinon.stub(CampaignReport.prototype, 'computeAverageResult');
  });

  it('should get the campaign', async function() {
    // when
    const resultCampaign = await getCampaign({
      campaignId,
      userId,
      badgeRepository,
      campaignRepository,
      campaignReportRepository,
      stageRepository,
    });

    // then
    expect(resultCampaign.name).to.equal(campaign.name);
    expect(campaignRepository.checkIfUserOrganizationHasAccessToCampaign)
      .calledWith(campaignId, userId);
  });

  it('should get campaign stages', async function() {
    // when
    const resultCampaign = await getCampaign({
      campaignId,
      userId,
      badgeRepository,
      campaignRepository,
      campaignReportRepository,
      stageRepository,
    });

    // then
    expect(resultCampaign.stages).to.equal(stages);
  });

  it('should get campaign badges', async function() {
    // when
    const resultCampaign = await getCampaign({
      campaignId,
      userId,
      badgeRepository,
      campaignRepository,
      campaignReportRepository,
      stageRepository,
    });

    // then
    expect(resultCampaign.badges).to.equal(badges);
  });

  it('should compute average results if campaign type is assessment', async function() {
    // when
    await getCampaign({
      campaignId,
      userId,
      badgeRepository,
      campaignRepository,
      campaignReportRepository,
      stageRepository,
    });

    // then
    sinon.assert.calledWithExactly(CampaignReport.prototype.computeAverageResult, masteryPercentages);
  });

  it('should not compute average results if campaign type is profiles collection', async function() {
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
      stageRepository,
    });

    // then
    sinon.assert.notCalled(CampaignReport.prototype.computeAverageResult);
  });

  it('should throw a Not found error when the campaign is searched with a not valid ID', async function() {
    // when
    const error = await catchErr(getCampaign)({
      campaignId: 'invalid Campaign Id',
      userId,
      badgeRepository,
      campaignRepository,
      campaignReportRepository,
      stageRepository,
    });

    // then
    expect(error).to.be.instanceOf(NotFoundError);
  });

  it('should throw UserNotAuthorizedToAccessEntityError when user does not belong to organization\'s campaign', async function() {
    // given
    campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(false);

    // when
    const error = await catchErr(getCampaign)({
      campaignId,
      userId,
      badgeRepository,
      campaignRepository,
      campaignReportRepository,
      stageRepository,
    });

    // then
    return expect(error).to.be.instanceOf(UserNotAuthorizedToAccessEntityError);
  });
});
