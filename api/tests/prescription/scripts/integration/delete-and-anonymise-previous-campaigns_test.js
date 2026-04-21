
import sinon from 'sinon';

import { DeleteAndAnonymisePreviousCampaignsScript } from '../../../../src/prescription/scripts/delete-and-anonymise-previous-campaigns.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('DeleteAndAnonymisePreviousCampaignsScript', function () {
  describe('Options', function () {
    it('has the correct options', function () {
      const script = new DeleteAndAnonymisePreviousCampaignsScript();
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
      script = new DeleteAndAnonymisePreviousCampaignsScript();
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
        archivedOrganizationAtDate.campaignDeletedAtDate = databaseBuilder.factory.buildCampaign({
          targetProfileId,
          name: 'campaignDeletedAtDate name',
          title: 'campaignDeletedAtDate title',
          customLandingPageText: 'campaignDeletedAtDate landing',
          externalIdHelpImageUrl: 'campaignDeletedAtDate help',
          alternativeTextToExternalIdHelpImage: 'campaignDeletedAtDate alt help',
          customResultPageText: 'campaignDeletedAtDate custom text',
          customResultPageButtonText: 'campaignDeletedAtDate custom button',
          customResultPageButtonUrl: 'campaignDeletedAtDate custom url',
          organizationId: archivedOrganizationAtDate.organization.id,
          deletedAt: now,
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

      describe('#archivedOrganizationBeforeDate', function () {
        it('should not anonymize deleted campaigns of archived organization before date', async function () {
          // when
          await script.handle({ options: { startArchiveDate }, logger });

          const campaignDeleted = await knex('campaigns')
            .select(
              'name',
              'title',
              'customLandingPageText',
              'externalIdHelpImageUrl',
              'alternativeTextToExternalIdHelpImage',
              'customResultPageText',
              'customResultPageButtonText',
              'customResultPageButtonUrl',
              'deletedAt',
              'deletedBy',
              'archivedAt',
            )
            .where('id', archivedOrganizationBeforeDate.campaignDeleted.id)
            .first();

          // then
          expect(campaignDeleted).deep.equal({
            name: archivedOrganizationBeforeDate.campaignDeleted.name,
            title: archivedOrganizationBeforeDate.campaignDeleted.title,
            customLandingPageText: archivedOrganizationBeforeDate.campaignDeleted.customLandingPageText,
            externalIdHelpImageUrl: archivedOrganizationBeforeDate.campaignDeleted.externalIdHelpImageUrl,
            alternativeTextToExternalIdHelpImage:
              archivedOrganizationBeforeDate.campaignDeleted.alternativeTextToExternalIdHelpImage,
            customResultPageText: archivedOrganizationBeforeDate.campaignDeleted.customResultPageText,
            customResultPageButtonText: archivedOrganizationBeforeDate.campaignDeleted.customResultPageButtonText,
            customResultPageButtonUrl: archivedOrganizationBeforeDate.campaignDeleted.customResultPageButtonUrl,
            deletedAt: archivedOrganizationBeforeDate.campaignDeleted.deletedAt,
            deletedBy: archivedOrganizationBeforeDate.campaignDeleted.deletedBy,
            archivedAt: archivedOrganizationBeforeDate.campaignDeleted.archivedAt,
          });
        });
      });

      describe('#archivedOrganizationAtDate', function () {
        it('should anonymise deleted campaigns before date of archived organization at date', async function () {
          // when
          await script.handle({ options: { startArchiveDate }, logger });

          const campaignDeleted = await knex('campaigns')
            .select(
              'name',
              'title',
              'customLandingPageText',
              'externalIdHelpImageUrl',
              'alternativeTextToExternalIdHelpImage',
              'customResultPageText',
              'customResultPageButtonText',
              'customResultPageButtonUrl',
              'deletedAt',
              'deletedBy',
              'archivedAt',
            )
            .where('id', archivedOrganizationAtDate.campaignDeleted.id)
            .first();

          // then
          expect(campaignDeleted).deep.equal({
            name: '(anonymized)',
            title: null,
            customLandingPageText: null,
            externalIdHelpImageUrl: null,
            alternativeTextToExternalIdHelpImage: null,
            customResultPageText: null,
            customResultPageButtonText: null,
            customResultPageButtonUrl: null,
            deletedAt: archivedOrganizationAtDate.campaignDeleted.deletedAt,
            deletedBy: archivedOrganizationAtDate.campaignDeleted.deletedBy,
            archivedAt: null,
          });
        });

        it('should not anonymise deleted campaigns at date of archived organization at date', async function () {
          // when
          await script.handle({ options: { startArchiveDate }, logger });

          const campaignDeleted = await knex('campaigns')
            .select(
              'name',
              'title',
              'customLandingPageText',
              'externalIdHelpImageUrl',
              'alternativeTextToExternalIdHelpImage',
              'customResultPageText',
              'customResultPageButtonText',
              'customResultPageButtonUrl',
              'deletedAt',
              'deletedBy',
              'archivedAt',
            )
            .where('id', archivedOrganizationAtDate.campaignDeletedAtDate.id)
            .first();

          // then
          expect(campaignDeleted).deep.equal({
            name: archivedOrganizationAtDate.campaignDeletedAtDate.name,
            title: archivedOrganizationAtDate.campaignDeletedAtDate.title,
            customLandingPageText: archivedOrganizationAtDate.campaignDeletedAtDate.customLandingPageText,
            externalIdHelpImageUrl: archivedOrganizationAtDate.campaignDeletedAtDate.externalIdHelpImageUrl,
            alternativeTextToExternalIdHelpImage:
              archivedOrganizationAtDate.campaignDeletedAtDate.alternativeTextToExternalIdHelpImage,
            customResultPageText: archivedOrganizationAtDate.campaignDeletedAtDate.customResultPageText,
            customResultPageButtonText: archivedOrganizationAtDate.campaignDeletedAtDate.customResultPageButtonText,
            customResultPageButtonUrl: archivedOrganizationAtDate.campaignDeletedAtDate.customResultPageButtonUrl,
            deletedAt: archivedOrganizationAtDate.campaignDeletedAtDate.deletedAt,
            deletedBy: archivedOrganizationAtDate.campaignDeletedAtDate.deletedBy,
            archivedAt: archivedOrganizationAtDate.campaignDeletedAtDate.archivedAt,
          });
        });
      });

      describe('#activeOrganization', function () {
        it('should not anonymise active campaigns of active organization', async function () {
          // when
          await script.handle({ options: { startArchiveDate }, logger });

          const campaignActive = await knex('campaigns')
            .select(
              'name',
              'title',
              'customLandingPageText',
              'externalIdHelpImageUrl',
              'alternativeTextToExternalIdHelpImage',
              'customResultPageText',
              'customResultPageButtonText',
              'customResultPageButtonUrl',
              'deletedAt',
              'deletedBy',
              'archivedAt',
            )
            .where('id', activeOrganization.campaignActive.id)
            .first();

          // then
          expect(campaignActive).deep.equal({
            name: activeOrganization.campaignActive.name,
            title: activeOrganization.campaignActive.title,
            customLandingPageText: activeOrganization.campaignActive.customLandingPageText,
            externalIdHelpImageUrl: activeOrganization.campaignActive.externalIdHelpImageUrl,
            alternativeTextToExternalIdHelpImage:
              activeOrganization.campaignActive.alternativeTextToExternalIdHelpImage,
            customResultPageText: activeOrganization.campaignActive.customResultPageText,
            customResultPageButtonText: activeOrganization.campaignActive.customResultPageButtonText,
            customResultPageButtonUrl: activeOrganization.campaignActive.customResultPageButtonUrl,
            deletedAt: activeOrganization.campaignActive.deletedAt,
            deletedBy: activeOrganization.campaignActive.deletedBy,
            archivedAt: activeOrganization.campaignActive.archivedAt,
          });
        });

        it('should anonymise deleted campaigns of active organization', async function () {
          // when
          await script.handle({ options: { startArchiveDate }, logger });

          const campaignDeleted = await knex('campaigns')
            .select(
              'name',
              'title',
              'customLandingPageText',
              'externalIdHelpImageUrl',
              'alternativeTextToExternalIdHelpImage',
              'customResultPageText',
              'customResultPageButtonText',
              'customResultPageButtonUrl',
              'deletedAt',
              'deletedBy',
              'archivedAt',
            )
            .where('id', activeOrganization.campaignDeleted.id)
            .first();

          // then
          expect(campaignDeleted).deep.equal({
            name: '(anonymized)',
            title: null,
            customLandingPageText: null,
            externalIdHelpImageUrl: null,
            alternativeTextToExternalIdHelpImage: null,
            customResultPageText: null,
            customResultPageButtonText: null,
            customResultPageButtonUrl: null,
            deletedAt: archivedOrganizationAtDate.campaignDeleted.deletedAt,
            deletedBy: archivedOrganizationAtDate.campaignDeleted.deletedBy,
            archivedAt: null,
          });
        });
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
              it('should not update delete participation of archived organization before date', async function () {
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
              it('anonymize deleted participation of archived organization at date', async function () {
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
                  userId: null,
                  participantExternalId: null,
                  deletedAt: archivedOrganizationAtDate.deletedParticipation.deletedAt,
                  deletedBy: archivedOrganizationAtDate.deletedParticipation.deletedBy,
                });
              });
            });

            describe('#activeOrganization', function () {
              it('should anonymise deleted participation of active organization', async function () {
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
                  userId: null,
                  participantExternalId: null,
                  deletedAt: activeOrganization.deletedParticipation.deletedAt,
                  deletedBy: userId,
                });
              });

              it('should not anonymise or active participation of active organization', async function () {
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
            });
          });

          describe('#assessments', function () {
            it('should detach assessments and update updatedAt column only on archived organization before date', async function () {
              // given
              // 1
              const assessmentFromDeletedParticipationOnArchivedOrganizationBeforeDate =
                databaseBuilder.factory.buildAssessment({
                  userId: archivedOrganizationBeforeDate.deletedLearner.userId,
                  campaignParticipationId: null,
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
              const assessmentFromDActiveParticipationOnActiveOrganization = databaseBuilder.factory.buildAssessment({
                userId: activeOrganization.activeLearner.userId,
                campaignParticipationId: activeOrganization.activeParticipation.id,
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

              const previousAnonymuzedAssessments = await knex('assessments')
                .select('id')
                .whereNot({ updatedAt: now })
                .whereNull('campaignParticipationId')
                .pluck('id');

              const activeAssessments = await knex('assessments')
                .select('id')
                .whereNot({ updatedAt: now })
                .whereNotNull('campaignParticipationId')
                .pluck('id');

              // then
              expect(activeAssessments).lengthOf(1);
              expect(activeAssessments).deep.members([assessmentFromDActiveParticipationOnActiveOrganization.id]);

              expect(previousAnonymuzedAssessments).lengthOf(1);
              expect(previousAnonymuzedAssessments).deep.members([
                assessmentFromDeletedParticipationOnArchivedOrganizationBeforeDate.id,
              ]);

              expect(anonymizedAssessments).lengthOf(2);
              expect(anonymizedAssessments).deep.members([
                assessmentFromDeletedParticipationOnArchivedOrganizationAtDate.id,
                assessmentFromDDeletedParticipationOnActiveOrganization.id,
              ]);
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
                updatedAt: new Date('2023-01-01'),
              });

              databaseBuilder.factory.buildUserRecommendedTraining({
                campaignParticipationId: activeOrganization.deletedParticipation.id,
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
              expect(anonymizedRecommendedTrainingResults).lengthOf(2);
              expect(anonymizedRecommendedTrainingResults).deep.members([
                {
                  campaignParticipationId: null,
                  userId: archivedOrganizationAtDate.deletedParticipation.userId,
                },
                {
                  campaignParticipationId: null,
                  userId: activeOrganization.deletedParticipation.userId,
                },
              ]);
              expect(activeRecommendedTrainings).lengthOf(1);
              expect(activeRecommendedTrainings).deep.members([
                {
                  campaignParticipationId: activeOrganization.activeParticipation.id,
                  userId: activeOrganization.activeParticipation.userId,
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

              await databaseBuilder.commit();

              // when
              await script.handle({ options: { startArchiveDate }, logger });

              const detachBadges = await knex('badge-acquisitions')
                .select('badgeId', 'campaignParticipationId')
                .whereNull('userId');

              // then
              expect(detachBadges).lengthOf(2);
              expect(detachBadges).deep.members([
                {
                  badgeId: nonCertifiableBadge.id,
                  campaignParticipationId: archivedOrganizationAtDate.deletedParticipation.id,
                },
                {
                  badgeId: nonCertifiableBadge.id,
                  campaignParticipationId: activeOrganization.deletedParticipation.id,
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
              databaseBuilder.factory.buildBadgeAcquisition({
                userId: activeOrganization.activeLearner.userId,
                badgeId: certifiableBadge.id,
                campaignParticipationId: activeOrganization.deletedParticipation.id,
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
                  campaignParticipationId: activeOrganization.deletedParticipation.id,
                  userId: activeOrganization.activeLearner.userId,
                },
              ]);
            });
          });
        });
      });
    });
  });
});
