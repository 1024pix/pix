import { expect, sinon } from '../../../test-helper';
import archiveCampaignFromCampaignCode from '../../../../lib/domain/usecases/archive-campaign-from-campaign-code';
import Campaign from '../../../../lib/domain/models/CampaignForArchiving';

describe('Unit | UseCase | archive-campaign', function () {
  let campaignForArchivingRepository;
  let clock;
  let now;

  beforeEach(function () {
    now = new Date('2022-01-01');
    clock = sinon.useFakeTimers(now);
    campaignForArchivingRepository = {
      getByCode: sinon.stub(),
      save: sinon.stub(),
    };
  });

  afterEach(function () {
    clock.restore();
  });

  it('updates the campaign', async function () {
    const userId = 1;
    const campaignCode = 2;
    const campaign = new Campaign({ id: 1, code: 'ABCD', archivedAt: null, archivedBy: null });
    const expectedCampaign = new Campaign({ id: 1, code: 'ABCD', archivedAt: now, archivedBy: userId });
    campaignForArchivingRepository.getByCode.resolves(campaign);

    await archiveCampaignFromCampaignCode({ userId, campaignCode, campaignForArchivingRepository });

    expect(campaignForArchivingRepository.getByCode).to.have.been.calledWithExactly(campaignCode);
    expect(campaignForArchivingRepository.save).to.have.been.calledWith(expectedCampaign);
  });
});
