import sinon from 'sinon';

import { Campaign } from '../../../../../../src/prescription/campaign/domain/models/Campaign.js';
import { archiveCampaign } from '../../../../../../src/prescription/campaign/domain/usecases/archive-campaign.js';

describe('Unit | UseCase | archive-campaign', function () {
  let clock;
  let now;
  let campaignAdministrationRepository;

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now: new Date('2022-01-01'), toFake: ['Date'] });
    now = new Date(clock.now);
    campaignAdministrationRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };
  });

  afterEach(function () {
    clock.restore();
  });

  it('should update the campaign', async function () {
    const campaign = new Campaign({ id: 1, code: 'ABC123' });
    const expectedCampaign = new Campaign({ id: 1, code: 'ABC123', archivedBy: 12, archivedAt: now });
    campaignAdministrationRepository.get.resolves(campaign);

    await archiveCampaign({ campaignId: 1, userId: 12, campaignAdministrationRepository });

    expect(campaignAdministrationRepository.get).to.have.been.calledWithExactly(1);
    expect(campaignAdministrationRepository.update).to.have.been.calledWithExactly(expectedCampaign);
  });
});
