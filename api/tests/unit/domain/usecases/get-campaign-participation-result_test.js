const { expect, sinon, catchErr } = require('../../../test-helper');
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
    campaignParticipationResultFactory;

  let usecaseDependencies;

  beforeEach(() => {
    campaignParticipationRepository = { get: sinon.stub() };
    campaignRepository = { checkIfUserOrganizationHasAccessToCampaign: sinon.stub() };
    targetProfileRepository = { getByCampaignId: sinon.stub() };
    badgeRepository = { findOneByTargetProfileId: sinon.stub() };
    badgeAcquisitionRepository = { hasAcquiredBadgeWithId: sinon.stub() };
    campaignParticipationResultFactory = { create: sinon.stub() };

    usecaseDependencies = {
      userId,
      campaignParticipationId,
      campaignParticipationRepository,
      campaignRepository,
      targetProfileRepository,
      badgeRepository,
      badgeAcquisitionRepository,
      campaignParticipationResultFactory
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
      const campaignParticipationResult = Symbol('campaignParticipationResult');

      campaignParticipationResultFactory.create.resolves(campaignParticipationResult);
      const actualCampaignParticipationResult = await getCampaignParticipationResult(usecaseDependencies);

      // then
      expect(actualCampaignParticipationResult).to.deep.equal(campaignParticipationResult);
    });

    context('when a badge is available for the campaignParticipationResult', () => {
      const badge = {
        id: Symbol('badgeId')
      };

      beforeEach(() => {
        // given
        badgeRepository.findOneByTargetProfileId.withArgs(targetProfileId).resolves(badge);
      });

      it('should assign badge to campaignParticipationResult', async () => {
        // when
        const campaignParticipationResult = {
          id: 'foo'
        };

        campaignParticipationResultFactory.create.resolves(campaignParticipationResult);
        const actualCampaignParticipationResult = await getCampaignParticipationResult(usecaseDependencies);

        // then
        expect(actualCampaignParticipationResult.badge).not.to.be.null;
      });

      context('when badge is acquired', () => {
        it('should assign badge acquisition to campaignParticipationResult', async () => {
          // given
          const campaignParticipationResult = {
            id: 'foo'
          };
          campaignParticipationResultFactory.create.resolves(campaignParticipationResult);

          badgeAcquisitionRepository.hasAcquiredBadgeWithId.withArgs({
            userId,
            badgeId: badge.id
          }).resolves(true);

          // when
          const actualCampaignParticipationResult = await getCampaignParticipationResult(usecaseDependencies);

          // then
          expect(actualCampaignParticipationResult.areBadgeCriteriaFulfilled).to.be.true;
        });
      });

      context('when badge is not acquired', () => {
        it('should not assign badge acquisition to campaignParticipationResult', async () => {
          // given
          const campaignParticipationResult = {
            id: 'foo'
          };
          campaignParticipationResultFactory.create.resolves(campaignParticipationResult);
          badgeAcquisitionRepository.hasAcquiredBadgeWithId.withArgs({
            userId,
            badgeId: badge.id
          }).resolves(false);

          // when
          const actualCampaignParticipationResult = await getCampaignParticipationResult(usecaseDependencies);

          // then
          expect(actualCampaignParticipationResult.areBadgeCriteriaFulfilled).to.be.false;
        });
      });
    });

    context('when no badge is available for the campaignParticipationResult', () => {
      beforeEach(() => {
        // given
        badgeRepository.findOneByTargetProfileId.withArgs(targetProfileId).resolves(null);
      });

      it('should not assign badge to campaignParticipationResult', async () => {
        // when
        const campaignParticipationResult = {
          id: 'foo'
        };

        campaignParticipationResultFactory.create.resolves(campaignParticipationResult);
        const actualCampaignParticipationResult = await getCampaignParticipationResult(usecaseDependencies);

        // then
        expect(actualCampaignParticipationResult.badge).to.be.null;
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
      campaignParticipationResultFactory.create.resolves(campaignParticipationResult);
      campaignParticipationRepository.get.withArgs(campaignParticipationId).resolves({ userId });
      targetProfileRepository.getByCampaignId.withArgs(campaignParticipation.campaignId).resolves(targetProfile);
      badgeRepository.findOneByTargetProfileId.withArgs(targetProfileId).resolves(badge);

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
