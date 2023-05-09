import { expect, sinon } from '../../../../test-helper.js';
import { archiveCampaigns } from '../../../../../lib/domain/usecases/campaigns-administration/archive-campaigns.js';

describe('Unit | UseCase | archive-campaign', function () {
  let campaignAdministrationRepository;
  const campaignIds = [666, 777];

  beforeEach(function () {
    campaignAdministrationRepository = {
      archiveCampaigns: sinon.stub(),
    };
  });

  context('when extracted campaignIds archived', function () {
    it('Should save these informations', async function () {
      const userId = Symbol('userId');
      campaignAdministrationRepository.archiveCampaigns.withArgs(campaignIds, userId).resolves();

      await archiveCampaigns({
        userId,
        campaignIds,
        campaignAdministrationRepository,
      });

      expect(campaignAdministrationRepository.archiveCampaigns).to.have.been.calledWith(campaignIds, userId);
    });
  });
});
