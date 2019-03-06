const { expect, sinon, catchErr } = require('../../../test-helper');
const getCampaignParticipations = require('../../../../lib/domain/usecases/get-campaign-participations');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-campaign-participations', () => {

  let campaignParticipationsResult;
  let requestErr;

  let options;
  let userId;
  let campaignId;
  let campaignParticipations;

  const campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
  const campaignParticipationRepository = { findWithUsersPaginated: sinon.stub() };

  beforeEach(() => {
    options = null;
    requestErr = null;
    userId = 'dummy userId';
    campaignId = 'dummy campaignId';
    campaignParticipations = ['some campaigns participations'];
  });

  context('the campaign participation is searched by campaign id', () => {
    beforeEach(() => {
      options = { filter: { campaignId } };
    });
    context('the assessment belongs to the user', () => {
      beforeEach(async () => {
        campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(true);
        campaignParticipationRepository.findWithUsersPaginated.resolves(campaignParticipations);

        campaignParticipationsResult = await getCampaignParticipations({
          userId,
          options,
          campaignParticipationRepository,
          campaignRepository
        });
      });
      it('should check if the user organization has access to the campaign', () => {
        expect(campaignRepository.checkIfUserOrganizationHasAccessToCampaign).to.have.been.calledWithExactly(campaignId, userId);
      });
      it('should find the campaign participations', () => {
        expect(campaignParticipationRepository.findWithUsersPaginated).to.have.been.calledWithExactly(options);
      });
      it('should return the campaign participations', () => {
        expect(campaignParticipationsResult).to.deep.equal(campaignParticipations);
      });
    });
    context('the assessment does not belong to the user', () => {
      beforeEach(async () => {
        campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(false);

        requestErr = await catchErr(getCampaignParticipations)({
          userId,
          options,
          campaignParticipationRepository,
          campaignRepository
        });
      });
      it('should throw a UserNotAuthorizedToAccessEntity error', () => {
        expect(requestErr).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
      });
    });
  });

});
