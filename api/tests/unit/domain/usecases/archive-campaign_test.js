import { expect, sinon } from '../../../test-helper.js';
import { CampaignForArchiving as Campaign } from '../../../../lib/domain/models/CampaignForArchiving.js';
import { archiveCampaign } from '../../../../lib/domain/usecases/archive-campaign.js';

describe('Unit | UseCase | archive-campaign', function () {
  let clock;
  let now;
  let campaignForArchivingRepository;

  beforeEach(function () {
    now = new Date('2022-01-01');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
    campaignForArchivingRepository = {
      get: sinon.stub(),
      save: sinon.stub(),
    };
  });

  afterEach(function () {
    clock.restore();
  });

  it('should update the campaign', async function () {
    const campaign = new Campaign({ id: 1, code: 'ABC123' });
    const expectedCampaign = new Campaign({ id: 1, code: 'ABC123', archivedBy: 12, archivedAt: now });
    campaignForArchivingRepository.get.resolves(campaign);

    await archiveCampaign({ campaignId: 1, userId: 12, campaignForArchivingRepository });

    expect(campaignForArchivingRepository.get).to.have.been.calledWithExactly(1);
    expect(campaignForArchivingRepository.save).to.have.been.calledWithExactly(expectedCampaign);
  });
});
