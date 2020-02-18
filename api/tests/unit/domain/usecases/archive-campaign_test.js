const { expect, sinon, catchErr } = require('../../../test-helper');
const archiveCampaign = require('../../../../lib/domain/usecases/archive-campaign');
const { UserNotAuthorizedToUpdateCampaignError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | archive-campaign', () => {

  const userId = 'user id';
  const campaignId = 'campaign id';
  let campaignRepository;

  beforeEach(() => {
    campaignRepository = {
      update: sinon.stub(),
      checkIfUserOrganizationHasAccessToCampaign: sinon.stub(),
    };
  });

  context('when the user has the rights to update the campaign', () => {

    beforeEach(() => {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
      return archiveCampaign({ campaignId, userId, campaignRepository });
    });

    it('should verify that the user has the rights', async () => {
      expect(campaignRepository.checkIfUserOrganizationHasAccessToCampaign).to.have.been.calledWithExactly(campaignId, userId);
    });

    it('should update the campaign', () => {
      expect(campaignRepository.update).to.have.been.calledWithExactly({ id: campaignId, archivedAt: sinon.match.instanceOf(Date) });
    });
  });

  context('when the user has no rights to update the campaign', () => {

    it('should throw a UserNotAuthorizedToUpdateCampaignError', async () => {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.rejects(new UserNotAuthorizedToUpdateCampaignError());

      const error = await catchErr(archiveCampaign)({ campaignId, userId, campaignRepository });

      expect(error).to.be.instanceOf(UserNotAuthorizedToUpdateCampaignError);
    });
  });

});
