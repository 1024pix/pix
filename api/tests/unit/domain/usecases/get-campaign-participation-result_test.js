const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const getCampaignParticipationResult = require('../../../../lib/domain/usecases/get-campaign-participation-result');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-campaign-participation-result', () => {

  const campaignParticipationId = 1;
  const targetProfileId = 1;
  const userId = 2;
  const campaignId = 'campaignId';
  const otherUserId = 3;
  const campaignParticipation = {
    campaignId,
    userId,
  };

  const targetProfile = {
    id: 1
  };

  let campaignParticipationRepository,
    campaignRepository,
    targetProfileRepository,
    badgeRepository,
    badgeAcquisitionRepository,
    campaignParticipationResultRepository;

  let usecaseDependencies;

  beforeEach(() => {
    campaignParticipationRepository = { get: sinon.stub() };
    campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
    targetProfileRepository = { getByCampaignId: sinon.stub() };
    badgeRepository = { findByTargetProfileId: sinon.stub().resolves([]) };
    badgeAcquisitionRepository = { getAcquiredBadgeIds: sinon.stub() };
    campaignParticipationResultRepository = { getByParticipationId: sinon.stub() };

    usecaseDependencies = {
      userId,
      campaignParticipationId,
      campaignParticipationRepository,
      campaignRepository,
      targetProfileRepository,
      badgeRepository,
      badgeAcquisitionRepository,
      campaignParticipationResultRepository
    };
  });

  context('when user belongs to the organization of the campaign', () => {
    beforeEach(() => {
      // given
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves(campaignParticipation);
      targetProfileRepository.getByCampaignId.withArgs(campaignParticipation.campaignId).resolves(targetProfile);
      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.withArgs(campaignId, otherUserId).resolves(true);
    });

    it('should get the campaignParticipationResult', async () => {
      // when
      const campaignParticipationResult = domainBuilder.buildCampaignParticipationResult();

      campaignParticipationResultRepository.getByParticipationId.resolves(campaignParticipationResult);
      const actualCampaignParticipationResult = await getCampaignParticipationResult(usecaseDependencies);

      // then
      expect(actualCampaignParticipationResult).to.deep.equal(campaignParticipationResult);
    });

    context('when a badge is available for the campaignParticipationResult', () => {
      const acquiredBadge = {
        id: Symbol('acquiredBadgeId'),
        key: 'ACQUIRED_BADGE',
        badgePartnerCompetences: [{
          id: Symbol('badgePartnerCompetencesId1')
        }]
      };
      const unacquiredBadge = {
        id: Symbol('unacquiredBadgeId'),
        key: 'UNACQUIRED_BADGE',
        badgePartnerCompetences: [{
          id: Symbol('badgePartnerCompetencesId2')
        }]
      };

      context('when the campaign only have one badge', function() {

        it('should assign badge acquisition to campaignParticipationResult', async () => {
          // given
          const campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({
            id: 'foo',
            campaignParticipationBadges: [acquiredBadge],
          });
          const campaignBadges = [acquiredBadge];
          const acquiredBadgeIds = [acquiredBadge.id];
          badgeRepository.findByTargetProfileId.withArgs(targetProfileId).resolves(campaignBadges);
          badgeAcquisitionRepository.getAcquiredBadgeIds.withArgs({
            userId,
            badgeIds: acquiredBadgeIds
          }).resolves(acquiredBadgeIds);
          campaignParticipationResultRepository.getByParticipationId.withArgs(
            campaignParticipationId,
            campaignBadges,
            acquiredBadgeIds,
          ).resolves(campaignParticipationResult);

          // when
          const actualCampaignParticipationResult = await getCampaignParticipationResult(usecaseDependencies);

          // then
          expect(actualCampaignParticipationResult.campaignParticipationBadges.length).to.equal(1);
        });

      });

      context('when the campaign only have two badges', function() {
        it('should assign badges to campaignParticipationResult', async () => {
          // given
          const campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({
            id: 'foo',
            campaignParticipationBadges: [acquiredBadge, unacquiredBadge],
          });
          const campaignBadges = [acquiredBadge, unacquiredBadge];
          const acquiredBadgeIds = [acquiredBadge.id];
          badgeRepository.findByTargetProfileId.withArgs(targetProfileId).resolves(campaignBadges);
          badgeAcquisitionRepository.getAcquiredBadgeIds.withArgs({
            userId,
            badgeIds: [acquiredBadge.id, unacquiredBadge.id]
          }).resolves([acquiredBadge.id]);
          campaignParticipationResultRepository.getByParticipationId.withArgs(
            campaignParticipationId,
            campaignBadges,
            acquiredBadgeIds,
          ).resolves(campaignParticipationResult);

          // when
          const actualCampaignParticipationResult = await getCampaignParticipationResult(usecaseDependencies);

          // then
          expect(actualCampaignParticipationResult.campaignParticipationBadges.length).to.equal(2);
        });
      });

    });
  });

  context('when user not belongs to the organization of the campaign or not own this campaignParticipation', () => {
    it('should throw an error', async () => {
      // given
      const campaignParticipationResult = Symbol('campaignParticipationResult');
      const badge = {
        id: Symbol('badgeId')
      };
      campaignParticipationResultRepository.getByParticipationId.resolves(campaignParticipationResult);
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves({ userId });
      targetProfileRepository.getByCampaignId.withArgs(campaignParticipation.campaignId).resolves(targetProfile);
      badgeRepository.findByTargetProfileId.withArgs(targetProfileId).resolves([badge]);

      campaignRepository.checkIfUserOrganizationHasAccessToCampaign.resolves(false);

      // when
      const result = await catchErr(getCampaignParticipationResult)({
        userId: 3,
        campaignParticipationId,
        campaignParticipationRepository,
        campaignRepository,
      });

      // then
      expect(result).to.be.instanceOf(UserNotAuthorizedToAccessEntity);
    });
  });
});
