import { expect, sinon } from '../../../test-helper';
import unarchiveCampaign from '../../../../lib/domain/usecases/unarchive-campaign';
import Campaign from '../../../../lib/domain/models/CampaignForArchiving';

describe('Unit | UseCase | unarchive-campaign', function () {
  let campaignForArchivingRepository;

  beforeEach(function () {
    campaignForArchivingRepository = {
      get: sinon.stub(),
      save: sinon.stub(),
    };
  });

  it('unarchives the campaign', async function () {
    const campaign = new Campaign({ id: 1, code: 'ABC123', archivedBy: 12, archivedAt: new Date('2022-01-01') });
    const expectedCampaign = new Campaign({ id: 1, code: 'ABC123', archivedBy: null, archivedAt: null });
    campaignForArchivingRepository.get.resolves(campaign);

    await unarchiveCampaign({ campaignId: 1, campaignForArchivingRepository });

    expect(campaignForArchivingRepository.get).to.have.been.calledWith(1);
    expect(campaignForArchivingRepository.save).to.have.been.calledWith(expectedCampaign);
  });
});
