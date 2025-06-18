import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { anonymousUserTokenRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/anonymous-user-token.repository.js';
import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Domain | UseCase | get-current-user', function () {
  it('gets the user basic information', async function () {
    // given
    const user = databaseBuilder.factory.buildUser({ shouldSeeDataProtectionPolicyInformationBanner: true });
    await databaseBuilder.commit();

    // when
    const currentUser = await usecases.getCurrentUser({ authenticatedUserId: user.id });

    // then
    expect(currentUser).to.deep.include({
      id: user.id,
      isAnonymous: false,
      anonymousUserToken: null,
      codeForLastProfileToShare: null,
      hasAssessmentParticipations: false,
      hasRecommendedTrainings: false,
      shouldSeeDataProtectionPolicyInformationBanner: true,
    });
  });

  context('when the user has a campaign profile to share', function () {
    it('returns the code for the last profile to share', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION', code: 'SOMECODE' });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        status: CampaignParticipationStatuses.TO_SHARE,
        userId: user.id,
      });
      await databaseBuilder.commit();

      // when
      const currentUser = await usecases.getCurrentUser({ authenticatedUserId: user.id });

      // then
      expect(currentUser).to.deep.include({ id: user.id, codeForLastProfileToShare: 'SOMECODE' });
    });
  });

  context('when the user has assessment participations', function () {
    it('returns hasAssessmentParticipations to true', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      const campaign = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT' });
      const participation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        userId: user.id,
      });
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId: participation.id,
        type: Assessment.types.CAMPAIGN,
        createdAt: participation.createdAt,
        userId: user.id,
      });
      await databaseBuilder.commit();

      // when
      const currentUser = await usecases.getCurrentUser({ authenticatedUserId: user.id });

      // then
      expect(currentUser).to.deep.include({ id: user.id, hasAssessmentParticipations: true });
    });
  });

  context('when the user has recommended trainings', function () {
    it('returns hasRecommendedTrainings to true', async function () {
      // given
      const user = databaseBuilder.factory.buildUser();
      databaseBuilder.factory.buildUserRecommendedTraining({
        userId: user.id,
        campaignParticipationId: databaseBuilder.factory.buildCampaignParticipation().id,
      });
      await databaseBuilder.commit();

      // when
      const currentUser = await usecases.getCurrentUser({ authenticatedUserId: user.id });

      // then
      expect(currentUser).to.deep.include({ id: user.id, hasRecommendedTrainings: true });
    });
  });

  context('when the user is anonymous', function () {
    it('returns anonymous to true and their token', async function () {
      // given
      const user = databaseBuilder.factory.buildUser({ isAnonymous: true });
      await databaseBuilder.commit();

      const anonymousUserToken = await anonymousUserTokenRepository.save(user.id);

      // when
      const currentUser = await usecases.getCurrentUser({ authenticatedUserId: user.id });

      // then
      expect(currentUser).to.deep.include({ id: user.id, isAnonymous: true, anonymousUserToken });
    });
  });
});
