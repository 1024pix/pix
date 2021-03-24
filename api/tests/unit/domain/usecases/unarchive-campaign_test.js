const { expect, sinon, catchErr } = require('../../../test-helper');
const unarchiveCampaign = require('../../../../lib/domain/usecases/unarchive-campaign');
const { UserNotAuthorizedToUpdateCampaignError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | unarchive-campaign', function() {

  const userId = 'user id';
  const campaignId = 'campaign id';
  let campaignRepository;

  beforeEach(function() {
    campaignRepository = {
      update: sinon.stub(),
      checkIfUserOrganizationHasAccessToCampaign: sinon.stub(),
    };
  });

  context('when the user has the rights to update the campaign', function() {

    beforeEach(function() {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, userId).resolves(true);
      return unarchiveCampaign({ campaignId, userId, campaignRepository });
    });

    it('should verify that the user has the rights', async function() {
      expect(campaignRepository.checkIfUserOrganizationHasAccessToCampaign).to.have.been.calledWithExactly(campaignId, userId);
    });

    it('should update the campaign', function() {
      expect(campaignRepository.update).to.have.been.calledWithExactly({ id: campaignId, archivedAt: null });
    });
  });

  context('when the user has no rights to update the campaign', function() {

    it('should throw a UserNotAuthorizedToUpdateCampaignError', async function() {
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.rejects(new UserNotAuthorizedToUpdateCampaignError());

      const error = await catchErr(unarchiveCampaign)({ campaignId, userId, campaignRepository });

      expect(error).to.be.instanceOf(UserNotAuthorizedToUpdateCampaignError);
    });
  });

});
