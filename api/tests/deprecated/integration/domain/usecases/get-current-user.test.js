import { usecases } from '../../../../../src/deprecated/domain/usecases/index.js';
import { CampaignParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Deprecated | Integration | Domain | UseCase | get-current-user', function () {
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
        status: CampaignParticipationStatuses.STARTED,
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

      // when
      const currentUser = await usecases.getCurrentUser({ authenticatedUserId: user.id });

      // then
      expect(currentUser).to.deep.include({ id: user.id, isAnonymous: true });
    });
  });

  context('pix-app TOS status', function () {
    context('when the newPixAppLegalDocumentsVersioning feature toggle  is enabled', function () {
      beforeEach(async function () {
        await featureToggles.set('newPixAppLegalDocumentsVersioning', true);
      });

      context('when the user has accepted the current version', function () {
        it('returns accepted status with document path', async function () {
          // given
          const versionAt = new Date('2024-06-01');

          // inconsistent data to highlight the fact that cgu and mustValidateTermsOfService are no longer the source of truth
          const user = databaseBuilder.factory.buildUser({ cgu: false, mustValidateTermsOfService: true });

          const documentVersion = databaseBuilder.factory.buildLegalDocumentVersion({
            service: 'pix-app',
            type: 'TOS',
            versionAt,
          });
          databaseBuilder.factory.buildLegalDocumentVersionUserAcceptance({
            userId: user.id,
            legalDocumentVersionId: documentVersion.id,
            acceptedAt: new Date('2024-06-15'),
          });
          await databaseBuilder.commit();

          // when
          const currentUser = await usecases.getCurrentUser({ authenticatedUserId: user.id });

          // then
          expect(currentUser).to.deep.include({
            cgu: true,
            mustValidateTermsOfService: false,
            pixAppTermsOfServiceStatus: 'accepted',
            pixAppTermsOfServiceDocumentPath: 'pix-app-tos-2024-06-01',
          });
        });
      });

      context('when the user has never accepted', function () {
        it('returns requested status with document path', async function () {
          // given
          const versionAt = new Date('2024-06-01');

          // inconsistent data to highlight the fact that cgu and mustValidateTermsOfService are no longer the source of truth
          const user = databaseBuilder.factory.buildUser({ cgu: true, mustValidateTermsOfService: false });

          databaseBuilder.factory.buildLegalDocumentVersion({
            service: 'pix-app',
            type: 'TOS',
            versionAt,
          });
          await databaseBuilder.commit();

          // when
          const currentUser = await usecases.getCurrentUser({ authenticatedUserId: user.id });

          // then
          expect(currentUser).to.deep.include({
            cgu: false,
            mustValidateTermsOfService: true,
            pixAppTermsOfServiceStatus: 'requested',
            pixAppTermsOfServiceDocumentPath: 'pix-app-tos-2024-06-01',
          });
        });
      });
    });

    context('when the newPixAppLegalDocumentsVersioning feature toggle is not enabled', function () {
      beforeEach(async function () {
        await featureToggles.set('newPixAppLegalDocumentsVersioning', false);
      });

      context('when the user has already accepted the CGU', function () {
        it('returns accepted status and cgu=true', async function () {
          // given
          const acceptedAt = new Date('2024-06-01');
          const user = databaseBuilder.factory.buildUser({
            cgu: true,
            mustValidateTermsOfService: false,
            lastTermsOfServiceValidatedAt: acceptedAt,
          });
          await databaseBuilder.commit();

          // when
          const currentUser = await usecases.getCurrentUser({ authenticatedUserId: user.id });

          // then
          expect(currentUser).to.deep.include({
            cgu: true,
            mustValidateTermsOfService: false,
            lastTermsOfServiceValidatedAt: acceptedAt,
            pixAppTermsOfServiceStatus: 'accepted',
            pixAppTermsOfServiceDocumentPath: null,
          });
        });
      });

      context('when the user must re-accept the CGU', function () {
        it('returns update-requested status and cgu=true', async function () {
          // given
          const user = databaseBuilder.factory.buildUser({
            cgu: true,
            mustValidateTermsOfService: true,
            lastTermsOfServiceValidatedAt: '2020-01-01',
          });
          await databaseBuilder.commit();

          // when
          const currentUser = await usecases.getCurrentUser({ authenticatedUserId: user.id });

          // then
          expect(currentUser).to.deep.include({
            cgu: true,
            mustValidateTermsOfService: true,
            lastTermsOfServiceValidatedAt: null,
            pixAppTermsOfServiceStatus: 'update-requested',
            pixAppTermsOfServiceDocumentPath: null,
          });
        });
      });
    });
  });
});
