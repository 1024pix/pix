const { expect, sinon, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const getCampaign = require('../../../../lib/domain/usecases/get-campaign');

describe('Unit | UseCase | get-campaign', () => {

  let campaign;
  let campaignReportRepository;
  let stageRepository;
  let badgeRepository;

  beforeEach(() => {
    campaign = {
      id: '1',
      name: 'My campaign',
    };
    campaignReportRepository = {
      get: sinon.stub(),
    };
    stageRepository = {
      findByCampaignId: sinon.stub(),
    };
    badgeRepository = {
      findByCampaignId: sinon.stub(),
    };
  });

  it('should get the campaign', async () => {
    // given
    campaignReportRepository.get.withArgs(parseInt(campaign.id)).resolves(campaign);
    stageRepository.findByCampaignId.withArgs(parseInt(campaign.id)).resolves();

    // when
    const resultCampaign = await getCampaign({ campaignId: campaign.id, badgeRepository, campaignReportRepository, stageRepository });

    // then
    expect(resultCampaign.name).to.equal(campaign.name);
  });

  it('should get campaign stages', async () => {
    // given
    const stages = Symbol('stages');
    campaignReportRepository.get.withArgs(parseInt(campaign.id)).resolves(campaign);
    stageRepository.findByCampaignId.withArgs(parseInt(campaign.id)).resolves(stages);

    // when
    const resultCampaign = await getCampaign({ campaignId: campaign.id, badgeRepository, campaignReportRepository, stageRepository });

    // then
    expect(resultCampaign.stages).to.equal(stages);
  });

  it('should get campaign badges', async () => {
    // given
    const badges = Symbol('badges');
    campaignReportRepository.get.withArgs(parseInt(campaign.id)).resolves(campaign);
    badgeRepository.findByCampaignId.withArgs(parseInt(campaign.id)).resolves(badges);

    // when
    const resultCampaign = await getCampaign({ campaignId: campaign.id, badgeRepository, campaignReportRepository, stageRepository });

    // then
    expect(resultCampaign.badges).to.equal(badges);
  });

  it('should throw a Not found error when the campaign is searched with a not valid ID', async () => {
    // given
    const invalidCampaignId = 'abc';

    // when
    const error = await catchErr(getCampaign)({ campaignId: invalidCampaignId, campaignReportRepository });

    // then
    return expect(error).to.be.instanceOf(NotFoundError);
  });
});
