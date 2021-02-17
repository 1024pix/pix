const { expect, sinon, catchErr } = require('../../../test-helper');
const {
  NotFoundError,
  UserNotAuthorizedToAccessEntityError,
} = require('../../../../lib/domain/errors');
const getCampaign = require('../../../../lib/domain/usecases/get-campaign');

describe('Unit | UseCase | get-campaign', () => {

  const badges = Symbol('badges');
  const stages = Symbol('stages');

  const campaignId = 1;
  const userId = 1;
  const campaign = {
    id: campaignId,
    name: 'My campaign',
  };

  let campaignRepository;
  let campaignReportRepository;
  let stageRepository;
  let badgeRepository;

  beforeEach(() => {
    badgeRepository = {
      findByCampaignId: sinon.stub(),
    };
    campaignRepository = {
      checkIfUserOrganizationHasAccessToCampaign: sinon.stub(),
    };
    campaignReportRepository = {
      get: sinon.stub(),
    };
    stageRepository = {
      findByCampaignId: sinon.stub(),
    };

    badgeRepository.findByCampaignId.resolves(badges);
    campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(true);
    campaignReportRepository.get.resolves(campaign);
    stageRepository.findByCampaignId.resolves(stages);
  });

  it('should get the campaign', async () => {
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

  it('should get campaign stages', async () => {
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

  it('should get campaign badges', async () => {
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

  it('should throw a Not found error when the campaign is searched with a not valid ID', async () => {
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

  it('should throw UserNotAuthorizedToAccessEntityError when user does not belong to organization\'s campaign', async () => {
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
