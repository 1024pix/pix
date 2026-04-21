import sinon from 'sinon';

import { DeleteAndAnonymisePreviousCampaignParticipationsScript } from '../../../../src/prescription/scripts/delete-and-anonymise-previous-participations.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('DeleteAndAnonymisePreviousCampaignParticipationsScript', function () {
  describe('Options', function () {
    it('has the correct options', function () {
      const script = new DeleteAndAnonymisePreviousCampaignParticipationsScript();
      const { options } = script.metaInfo;

      expect(options.startArchiveDate).to.deep.include({
        type: 'date',
        describe: 'date to start anonymisation',
        demandOption: true,
      });
    });
  });

  describe('Handle', function () {
    let script;
    let logger;
    const ENGINEERING_USER_ID = 99999;
    const startArchiveDate = '2025-01-01';

    let now, clock;
    let userId;
    let targetProfileId;

    const archivedOrganizationBeforeDate = {
      organization: null,
      campaignDeleted: null,
      deletedLearner: null,
      deletedParticipation: null,
    };

    const archivedOrganizationAtDate = {
      organization: null,
      campaignDeleted: null,
      deletedLearner: null,
      deletedParticipation: null,
    };

    const activeOrganization = {
      organization: null,
      campaignDeleted: null,
      campaignActive: null,
      activeLearner: null,
      activeParticipation: null,
      deletedParticipation: null,
    };

    beforeEach(async function () {
      script = new DeleteAndAnonymisePreviousCampaignParticipationsScript();
      logger = { info: sinon.spy(), error: sinon.spy() };
      sinon.stub(process, 'env').value({ ENGINEERING_USER_ID });
      now = new Date(startArchiveDate);
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });

      userId = databaseBuilder.factory.buildUser().id;
      databaseBuilder.factory.buildUser({ id: ENGINEERING_USER_ID });

      archivedOrganizationBeforeDate.organization = databaseBuilder.factory.buildOrganization({
        createdAt: new Date('2020-01-01'),
        archivedAt: new Date('2024-01-01'),
      });
      archivedOrganizationAtDate.organization = databaseBuilder.factory.buildOrganization({
        createdAt: new Date('2020-01-01'),
        archivedAt: now,
      });
      activeOrganization.organization = databaseBuilder.factory.buildOrganization({
        createdAt: new Date('2020-01-01'),
      });

      await databaseBuilder.commit();
    });

    afterEach(function () {
      clock.restore();
    });

    describe('#campaigns', function () {
      beforeEach(async function () {
        // 1
        targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        archivedOrganizationBeforeDate.campaignDeleted = databaseBuilder.factory.buildCampaign({
          targetProfileId,
          name: 'campaignDeleted name',
          title: 'campaignDeleted title',
          customLandingPageText: 'campaignDeleted landing',
          externalIdHelpImageUrl: 'campaignDeleted help',
          alternativeTextToExternalIdHelpImage: 'campaignDeleted alt help',
          customResultPageText: 'campaignDeleted custom text',
          customResultPageButtonText: 'campaignDeleted custom button',
          customResultPageButtonUrl: 'campaignDeleted custom url',
          organizationId: archivedOrganizationBeforeDate.organization.id,
          deletedAt: new Date('2023-01-01'),
          deletedBy: userId,
          archivedAt: archivedOrganizationBeforeDate.organization.archivedAt,
        });

        // 2
        archivedOrganizationAtDate.campaignDeleted = databaseBuilder.factory.buildCampaign({
          targetProfileId,
          name: 'campaignDeleted name',
          title: 'campaignDeleted title',
          customLandingPageText: 'campaignDeleted landing',
          externalIdHelpImageUrl: 'campaignDeleted help',
          alternativeTextToExternalIdHelpImage: 'campaignDeleted alt help',
          customResultPageText: 'campaignDeleted custom text',
          customResultPageButtonText: 'campaignDeleted custom button',
          customResultPageButtonUrl: 'campaignDeleted custom url',
          organizationId: archivedOrganizationAtDate.organization.id,
          deletedAt: new Date('2023-01-01'),
          deletedBy: userId,
          archivedAt: null,
        });

        // 3
        activeOrganization.campaignDeleted = databaseBuilder.factory.buildCampaign({
          targetProfileId,
          name: 'campaignDeleted name',
          title: 'campaignDeleted title',
          customLandingPageText: 'campaignDeleted landing',
          externalIdHelpImageUrl: 'campaignDeleted help',
          alternativeTextToExternalIdHelpImage: 'campaignDeleted alt help',
          customResultPageText: 'campaignDeleted custom text',
          customResultPageButtonText: 'campaignDeleted custom button',
          customResultPageButtonUrl: 'campaignDeleted custom url',
          organizationId: activeOrganization.organization.id,
          deletedAt: new Date('2023-01-01'),
          deletedBy: userId,
          archivedAt: null,
        });
        activeOrganization.campaignActive = databaseBuilder.factory.buildCampaign({
          targetProfileId,
          name: 'campaignActive name',
          title: 'campaignActive title',
          customLandingPageText: 'campaignActive landing',
          externalIdHelpImageUrl: 'campaignActive help',
          alternativeTextToExternalIdHelpImage: 'campaignActive alt help',
          customResultPageText: 'campaignActive custom text',
          customResultPageButtonText: 'campaignActive custom button',
          customResultPageButtonUrl: 'campaignActive custom url',
          organizationId: activeOrganization.organization.id,
          deletedAt: null,
          deletedBy: null,
          archivedAt: null,
        });

        await databaseBuilder.commit();
      });

      describe('#participations', function () {
        beforeEach(async function () {
          // 1
          archivedOrganizationBeforeDate.deletedLearner =
            databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
              firstName: 'johnny',
              lastName: 'five',
              organizationId: archivedOrganizationBeforeDate.organization.id,
              updatedAt: new Date('2024-01-25'),
              deletedAt: new Date('2024-01-25'),
              deletedBy: userId,
            });

          // 2
          archivedOrganizationAtDate.deletedLearner =
            databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
              firstName: 'johnny',
              lastName: 'not be good',
              organizationId: archivedOrganizationAtDate.organization.id,
              updatedAt: new Date('2024-01-25'),
              deletedAt: new Date('2023-01-01'),
              deletedBy: userId,
            });

          // 3
          activeOrganization.activeLearner =
            databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
              firstName: 'johnny',
              lastName: 'be good',
              organizationId: activeOrganization.organization.id,
              deletedAt: null,
              deletedBy: null,
            });

          await databaseBuilder.commit();
        });

        describe('#participations / assessment / recommended trainings / badge ', function () {
          beforeEach(async function () {
            // 1
            archivedOrganizationBeforeDate.deletedParticipation = databaseBuilder.factory.buildCampaignParticipation({
              userId: archivedOrganizationBeforeDate.deletedLearner.userId,
              organizationLearnerId: archivedOrganizationBeforeDate.deletedLearner.id,
              participantExternalId: 'another-learner',
              campaignId: archivedOrganizationBeforeDate.campaignDeleted.id,
              deletedAt: new Date('2023-01-01'),
              deletedBy: userId,
            });

            // 2
            archivedOrganizationAtDate.deletedParticipation = databaseBuilder.factory.buildCampaignParticipation({
              userId: archivedOrganizationAtDate.deletedLearner.userId,
              organizationLearnerId: archivedOrganizationAtDate.deletedLearner.id,
              participantExternalId: 'second',
              campaignId: archivedOrganizationAtDate.campaignDeleted.id,
              deletedAt: new Date('2023-01-01'),
              deletedBy: userId,
            });

            // 3
            activeOrganization.activeParticipation = databaseBuilder.factory.buildCampaignParticipation({
              userId: activeOrganization.activeLearner.userId,
              organizationLearnerId: activeOrganization.activeLearner.id,
              participantExternalId: 'second',
              isImproved: true,
              campaignId: activeOrganization.campaignActive.id,
              deletedAt: null,
              deletedBy: null,
            });

            activeOrganization.deletedParticipation = databaseBuilder.factory.buildCampaignParticipation({
              userId: activeOrganization.activeLearner.userId,
              organizationLearnerId: activeOrganization.activeLearner.id,
              participantExternalId: 'second',
              campaignId: activeOrganization.campaignDeleted.id,
              deletedAt: new Date('2023-01-01'),
              deletedBy: userId,
            });

            await databaseBuilder.commit();
          });

          describe('#participations', function () {
            describe('#archivedOrganizationBeforeDate', function () {
              it('should not update delete participation of deleted campaign on archived organization before date', async function () {
                // when
                await script.handle({
                  options: { startArchiveDate },
                  logger,
                });

                const deletedParticipation = await knex('campaign-participations')
                  .select('userId', 'participantExternalId', 'deletedAt', 'deletedBy')
                  .where('id', archivedOrganizationBeforeDate.deletedParticipation.id)
                  .first();

                // then
                expect(deletedParticipation).deep.equal({
                  userId: archivedOrganizationBeforeDate.deletedParticipation.userId,
                  participantExternalId: archivedOrganizationBeforeDate.deletedParticipation.participantExternalId,
                  deletedAt: archivedOrganizationBeforeDate.deletedParticipation.deletedAt,
                  deletedBy: archivedOrganizationBeforeDate.deletedParticipation.deletedBy,
                });
              });
            });

            describe('#archivedOrganizationAtDate', function () {
              it('should not update deleted participation of deleted campaigns on archived organization at date', async function () {
                // when
                await script.handle({
                  options: { startArchiveDate },
                  logger,
                });

                const deletedParticipation = await knex('campaign-participations')
                  .select('userId', 'participantExternalId', 'deletedAt', 'deletedBy')
                  .where('id', archivedOrganizationAtDate.deletedParticipation.id)
                  .first();

                // then
                expect(deletedParticipation).deep.equal({
                  userId: archivedOrganizationAtDate.deletedParticipation.userId,
                  participantExternalId: archivedOrganizationAtDate.deletedParticipation.participantExternalId,
                  deletedAt: archivedOrganizationAtDate.deletedParticipation.deletedAt,
                  deletedBy: archivedOrganizationAtDate.deletedParticipation.deletedBy,
                });
              });
            });

            describe('#activeOrganization', function () {
              it('should not anonymise deleted participation of deleted campaign on active organization', async function () {
                // when
                await script.handle({
                  options: { startArchiveDate },
                  logger,
                });

                const deleteParticipation = await knex('campaign-participations')
                  .select('userId', 'participantExternalId', 'deletedAt', 'deletedBy')
                  .where('id', activeOrganization.deletedParticipation.id)
                  .first();

                // then
                expect(deleteParticipation).deep.equal({
                  userId: activeOrganization.deletedParticipation.userId,
                  participantExternalId: activeOrganization.deletedParticipation.participantExternalId,
                  deletedAt: activeOrganization.deletedParticipation.deletedAt,
                  deletedBy: userId,
                });
              });

              it('should not anonymise of active participation of active organization', async function () {
                // when
                await script.handle({
                  options: { startArchiveDate },
                  logger,
                });

                const activeParticipation = await knex('campaign-participations')
                  .select('userId', 'participantExternalId', 'deletedAt', 'deletedBy')
                  .where('id', activeOrganization.activeParticipation.id)
                  .first();

                // then
                expect(activeParticipation).deep.equal({
                  userId: activeOrganization.activeParticipation.userId,
                  participantExternalId: activeOrganization.activeParticipation.participantExternalId,
                  deletedAt: null,
                  deletedBy: null,
                });
              });

              it('should anonymise of deleted participation only of active campaign on active organization', async function () {
                // when
                const deletedParticipationActiveCampaign = databaseBuilder.factory.buildCampaignParticipation({
                  userId: activeOrganization.activeLearner.userId,
                  organizationLearnerId: activeOrganization.activeLearner.id,
                  participantExternalId: 'second',
                  campaignId: activeOrganization.campaignActive.id,
                  deletedAt: new Date('2024-01-01'),
                  deletedBy: userId,
                  isImproved: true,
                });

                const deletedImprovedParticipationActiveCampaign = databaseBuilder.factory.buildCampaignParticipation({
                  userId: activeOrganization.activeLearner.userId,
                  organizationLearnerId: activeOrganization.activeLearner.id,
                  participantExternalId: 'second',
                  isImproved: false,
                  campaignId: activeOrganization.campaignActive.id,
                  deletedAt: new Date('2024-02-01'),
                  deletedBy: userId,
                });

                await databaseBuilder.commit();
                await script.handle({
                  options: { startArchiveDate },
                  logger,
                });

                const activeParticipation = await knex('campaign-participations')
                  .select('id', 'userId', 'participantExternalId', 'deletedAt', 'deletedBy')
                  .whereNull('userId');

                // then
                expect(activeParticipation).deep.members([
                  {
                    id: deletedParticipationActiveCampaign.id,
                    userId: null,
                    participantExternalId: null,
                    deletedAt: deletedParticipationActiveCampaign.deletedAt,
                    deletedBy: deletedParticipationActiveCampaign.deletedBy,
                  },
                  {
                    id: deletedImprovedParticipationActiveCampaign.id,
                    userId: null,
                    participantExternalId: null,
                    deletedAt: deletedImprovedParticipationActiveCampaign.deletedAt,
                    deletedBy: deletedImprovedParticipationActiveCampaign.deletedBy,
                  },
                ]);
              });
            });
          });

          describe('#assessments', function () {
            it('should detach assessments and update updatedAt column only on deleted participations on active campaign', async function () {
              // given
              // 1
              const assessmentFromDeletedParticipationOnArchivedOrganizationBeforeDate =
                databaseBuilder.factory.buildAssessment({
                  userId: archivedOrganizationBeforeDate.deletedLearner.userId,
                  campaignParticipationId: archivedOrganizationBeforeDate.deletedParticipation.id,
                  updatedAt: new Date('2024-01-01'),
                });

              // 2
              const assessmentFromDeletedParticipationOnArchivedOrganizationAtDate =
                databaseBuilder.factory.buildAssessment({
                  userId: archivedOrganizationAtDate.deletedLearner.userId,
                  campaignParticipationId: archivedOrganizationAtDate.deletedParticipation.id,
                  updatedAt: new Date('2021-01-01'),
                });

              // 3
              const deletedImprovedParticipationActiveCampaign = databaseBuilder.factory.buildCampaignParticipation({
                userId: activeOrganization.activeLearner.userId,
                organizationLearnerId: activeOrganization.activeLearner.id,
                participantExternalId: 'second',
                isImproved: false,
                campaignId: activeOrganization.campaignActive.id,
                deletedAt: new Date('2024-02-01'),
                deletedBy: userId,
              });

              const assessmentFromDActiveParticipationOnActiveOrganization = databaseBuilder.factory.buildAssessment({
                userId: activeOrganization.activeLearner.userId,
                campaignParticipationId: deletedImprovedParticipationActiveCampaign.id,
                updatedAt: new Date('2024-01-01'),
              });

              const assessmentFromDDeletedParticipationOnActiveOrganization = databaseBuilder.factory.buildAssessment({
                userId: activeOrganization.activeLearner.userId,
                campaignParticipationId: activeOrganization.deletedParticipation.id,
                updatedAt: new Date('2024-01-01'),
              });

              await databaseBuilder.commit();

              // when
              await script.handle({ options: { startArchiveDate }, logger });

              const anonymizedAssessments = await knex('assessments')
                .select('id')
                .where({ updatedAt: now })
                .whereNull('campaignParticipationId')
                .pluck('id');

              const activeAssessments = await knex('assessments')
                .select('id')
                .whereNot({ updatedAt: now })
                .whereNotNull('campaignParticipationId')
                .pluck('id');

              // then
              expect(activeAssessments).lengthOf(3);
              expect(activeAssessments).deep.members([
                assessmentFromDDeletedParticipationOnActiveOrganization.id,
                assessmentFromDeletedParticipationOnArchivedOrganizationAtDate.id,
                assessmentFromDeletedParticipationOnArchivedOrganizationBeforeDate.id,
              ]);

              expect(anonymizedAssessments).lengthOf(1);
              expect(anonymizedAssessments).deep.members([assessmentFromDActiveParticipationOnActiveOrganization.id]);
            });
          });

          describe('#recommendedTrainings', function () {
            it('should detach user recommended trainings only on archived organization before date', async function () {
              // given
              const training = databaseBuilder.factory.buildTraining();
              const training2 = databaseBuilder.factory.buildTraining();

              // 1
              databaseBuilder.factory.buildUserRecommendedTraining({
                campaignParticipationId: null,
                trainingId: training.id,
                userId: archivedOrganizationBeforeDate.deletedLearner.userId,
                updatedAt: new Date('2025-10-01'),
              });
              databaseBuilder.factory.buildUserRecommendedTraining({
                campaignParticipationId: null,
                trainingId: training2.id,
                userId: archivedOrganizationBeforeDate.deletedLearner.userId,
                updatedAt: new Date('2025-10-01'),
              });

              // 2
              databaseBuilder.factory.buildUserRecommendedTraining({
                campaignParticipationId: archivedOrganizationAtDate.deletedParticipation.id,
                trainingId: training2.id,
                userId: archivedOrganizationAtDate.deletedLearner.userId,
                updatedAt: new Date('2024-01-01'),
              });

              // 3
              databaseBuilder.factory.buildUserRecommendedTraining({
                campaignParticipationId: activeOrganization.activeParticipation.id,
                trainingId: training2.id,
                userId: activeOrganization.activeLearner.userId,
                updatedAt: new Date('2022-01-01'),
              });

              databaseBuilder.factory.buildUserRecommendedTraining({
                campaignParticipationId: activeOrganization.deletedParticipation.id,
                trainingId: training2.id,
                userId: activeOrganization.activeLearner.userId,
                updatedAt: new Date('2023-01-01'),
              });

              const deletedImprovedParticipationActiveCampaign = databaseBuilder.factory.buildCampaignParticipation({
                userId: activeOrganization.activeLearner.userId,
                organizationLearnerId: activeOrganization.activeLearner.id,
                participantExternalId: 'second',
                isImproved: false,
                campaignId: activeOrganization.campaignActive.id,
                deletedAt: new Date('2024-02-01'),
                deletedBy: userId,
              });

              databaseBuilder.factory.buildUserRecommendedTraining({
                campaignParticipationId: deletedImprovedParticipationActiveCampaign.id,
                trainingId: training2.id,
                userId: activeOrganization.activeLearner.userId,
                updatedAt: new Date('2023-01-01'),
              });

              await databaseBuilder.commit();

              // when
              await script.handle({ options: { startArchiveDate }, logger });

              const anonymizedRecommendedTrainingResults = await knex('user-recommended-trainings')
                .select('campaignParticipationId', 'userId')
                .whereNull('campaignParticipationId')
                .where({ updatedAt: now });

              const activeRecommendedTrainings = await knex('user-recommended-trainings')
                .select('campaignParticipationId', 'userId', 'updatedAt')
                .whereNotNull('campaignParticipationId');

              // then
              expect(anonymizedRecommendedTrainingResults).lengthOf(1);
              expect(anonymizedRecommendedTrainingResults).deep.members([
                {
                  campaignParticipationId: null,
                  userId: activeOrganization.activeLearner.userId,
                },
              ]);
              expect(activeRecommendedTrainings).lengthOf(3);
              expect(activeRecommendedTrainings).deep.members([
                {
                  campaignParticipationId: archivedOrganizationAtDate.deletedParticipation.id,
                  userId: archivedOrganizationAtDate.deletedParticipation.userId,
                  updatedAt: new Date('2024-01-01'),
                },
                {
                  campaignParticipationId: activeOrganization.activeParticipation.id,
                  userId: activeOrganization.activeParticipation.userId,
                  updatedAt: new Date('2022-01-01'),
                },
                {
                  campaignParticipationId: activeOrganization.deletedParticipation.id,
                  userId: activeOrganization.deletedParticipation.userId,
                  updatedAt: new Date('2023-01-01'),
                },
              ]);
            });
          });

          describe('#badges', function () {
            let certifiableBadge, nonCertifiableBadge;

            beforeEach(async function () {
              certifiableBadge = databaseBuilder.factory.buildBadge.certifiable({
                key: 'CERTIFIABLE_BADGE',
                targetProfileId,
              });
              nonCertifiableBadge = databaseBuilder.factory.buildBadge.notCertifiable({
                key: 'NON_CERTIFIABLE_BADGE',
                targetProfileId,
              });

              await databaseBuilder.commit();
            });

            it('should detach non certifiable badges only on delete campaign not belonging to archived organization before date', async function () {
              // given
              // 1
              databaseBuilder.factory.buildBadgeAcquisition({
                userId: archivedOrganizationBeforeDate.deletedLearner.userId,
                badgeId: nonCertifiableBadge.id,
                campaignParticipationId: archivedOrganizationBeforeDate.deletedParticipation.id,
              });
              databaseBuilder.factory.buildBadgeAcquisition({
                userId: archivedOrganizationBeforeDate.deletedLearner.userId,
                badgeId: nonCertifiableBadge.id,
                campaignParticipationId: archivedOrganizationBeforeDate.deletedParticipation.id,
              });

              // 2
              databaseBuilder.factory.buildBadgeAcquisition({
                userId: archivedOrganizationAtDate.deletedLearner.userId,
                badgeId: nonCertifiableBadge.id,
                campaignParticipationId: archivedOrganizationAtDate.deletedParticipation.id,
              });

              // 3
              databaseBuilder.factory.buildBadgeAcquisition({
                userId: activeOrganization.activeLearner.userId,
                badgeId: nonCertifiableBadge.id,
                campaignParticipationId: activeOrganization.activeParticipation.id,
              });

              databaseBuilder.factory.buildBadgeAcquisition({
                userId: activeOrganization.activeLearner.userId,
                badgeId: nonCertifiableBadge.id,
                campaignParticipationId: activeOrganization.deletedParticipation.id,
              });

              const deletedImprovedParticipationActiveCampaign = databaseBuilder.factory.buildCampaignParticipation({
                userId: activeOrganization.activeLearner.userId,
                organizationLearnerId: activeOrganization.activeLearner.id,
                participantExternalId: 'second',
                isImproved: false,
                campaignId: activeOrganization.campaignActive.id,
                deletedAt: new Date('2024-02-01'),
                deletedBy: userId,
              });

              databaseBuilder.factory.buildBadgeAcquisition({
                userId: deletedImprovedParticipationActiveCampaign.userId,
                badgeId: nonCertifiableBadge.id,
                campaignParticipationId: deletedImprovedParticipationActiveCampaign.id,
              });

              await databaseBuilder.commit();

              // when
              await script.handle({ options: { startArchiveDate }, logger });

              const detachBadges = await knex('badge-acquisitions')
                .select('badgeId', 'campaignParticipationId')
                .whereNull('userId');

              // then
              expect(detachBadges).lengthOf(1);
              expect(detachBadges).deep.members([
                {
                  badgeId: nonCertifiableBadge.id,
                  campaignParticipationId: deletedImprovedParticipationActiveCampaign.id,
                },
              ]);
            });

            it('should not detach certifiable badge', async function () {
              // given
              databaseBuilder.factory.buildBadgeAcquisition({
                userId: archivedOrganizationBeforeDate.deletedLearner.userId,
                badgeId: certifiableBadge.id,
                campaignParticipationId: archivedOrganizationBeforeDate.deletedParticipation.id,
              });

              const deletedImprovedParticipationActiveCampaign = databaseBuilder.factory.buildCampaignParticipation({
                userId: activeOrganization.activeLearner.userId,
                organizationLearnerId: activeOrganization.activeLearner.id,
                participantExternalId: 'second',
                isImproved: false,
                campaignId: activeOrganization.campaignActive.id,
                deletedAt: new Date('2024-02-01'),
                deletedBy: userId,
              });

              databaseBuilder.factory.buildBadgeAcquisition({
                userId: deletedImprovedParticipationActiveCampaign.userId,
                badgeId: certifiableBadge.id,
                campaignParticipationId: deletedImprovedParticipationActiveCampaign.id,
              });

              await databaseBuilder.commit();

              // when
              await script.handle({ options: { startArchiveDate }, logger });

              const attachBadges = await knex('badge-acquisitions').select(
                'badgeId',
                'campaignParticipationId',
                'userId',
              );

              // then
              expect(attachBadges).lengthOf(2);
              expect(attachBadges).deep.equal([
                {
                  badgeId: certifiableBadge.id,
                  campaignParticipationId: archivedOrganizationBeforeDate.deletedParticipation.id,
                  userId: archivedOrganizationBeforeDate.deletedLearner.userId,
                },
                {
                  badgeId: certifiableBadge.id,
                  campaignParticipationId: deletedImprovedParticipationActiveCampaign.id,
                  userId: deletedImprovedParticipationActiveCampaign.userId,
                },
              ]);
            });
          });
        });
      });
    });
  });
});
