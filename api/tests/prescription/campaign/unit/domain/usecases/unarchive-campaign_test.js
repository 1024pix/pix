import { Campaign } from '../../../../../../src/prescription/campaign/domain/models/Campaign.js';
import { unarchiveCampaign } from '../../../../../../src/prescription/campaign/domain/usecases/unarchive-campaign.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Unit | UseCase | unarchive-campaign', function () {
  let campaignAdministrationRepository;

  beforeEach(function () {
    campaignAdministrationRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };
  });

  it('unarchives the campaign', async function () {
    const campaign = new Campaign({ id: 1, code: 'ABC123', archivedBy: 12, archivedAt: new Date('2022-01-01') });
    const expectedCampaign = new Campaign({ id: 1, code: 'ABC123', archivedBy: null, archivedAt: null });
    campaignAdministrationRepository.get.resolves(campaign);

    await unarchiveCampaign({ campaignId: 1, campaignAdministrationRepository });

    expect(campaignAdministrationRepository.get).to.have.been.calledWithExactly(1);
    expect(campaignAdministrationRepository.update).to.have.been.calledWithExactly(expectedCampaign);
  });
});
