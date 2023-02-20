const { expect, sinon } = require('../../../../test-helper');
const archiveCampaigns = require('../../../../../lib/domain/usecases/campaigns-administration/archive-campaigns');

describe('Unit | UseCase | archive-campaign', function () {
  let campaignAdministrationRepository;
  const campaignIds = [666, 777];

  beforeEach(function () {
    campaignAdministrationRepository = {
      archiveCampaigns: sinon.stub(),
    };
  });

  afterEach(function () {
    sinon.restore();
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
