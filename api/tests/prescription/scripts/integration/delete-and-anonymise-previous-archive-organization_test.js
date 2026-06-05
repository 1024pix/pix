import { expect } from 'chai';
import sinon from 'sinon';

import { DeleteAndAnonymisePreviousOrganizationScript } from '../../../../src/prescription/scripts/delete-and-anonymise-previous-archive-organization.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('DeleteAndAnonymisePreviousOrganizationScript', function () {
  describe('Options', function () {
    it('has the correct options', function () {
      const script = new DeleteAndAnonymisePreviousOrganizationScript();
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
      campaignArchived: null,
      activeLearner: null,
      activeParticipation: null,
      deletedParticipation: null,
    };
    const archivedOrganizationAtDate = {
      organization: null,
      campaignDeleted: null,
      activeLearner: null,
      activeParticipation: null,
      deletedParticipation: null,
    };
    const activeOrganization = {
      organization: null,
      campaignDeleted: null,
      campaignArchived: null,
      activeLearner: null,
      activeParticipation: null,
      deletedParticipation: null,
    };

    beforeEach(async function () {
      script = new DeleteAndAnonymisePreviousOrganizationScript();
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
        archivedOrganizationBeforeDate.campaignArchived = databaseBuilder.factory.buildCampaign({
          targetProfileId,
          name: 'campaignArchived name',
          title: 'campaignArchived title',
          customLandingPageText: 'campaignArchived landing',
          externalIdHelpImageUrl: 'campaignArchived help',
          alternativeTextToExternalIdHelpImage: 'campaignArchived alt help',
          customResultPageText: 'campaignArchived custom text',
          customResultPageButtonText: 'campaignArchived custom button',
          customResultPageButtonUrl: 'campaignArchived custom url',
          organizationId: archivedOrganizationBeforeDate.organization.id,
          deletedAt: null,
          deletedBy: null,
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
          archivedAt: archivedOrganizationAtDate.organization.archivedAt,
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
        activeOrganization.campaignArchived = databaseBuilder.factory.buildCampaign({
          targetProfileId,
          name: 'campaignArchived name',
          title: 'campaignArchived title',
          customLandingPageText: 'campaignArchived landing',
          externalIdHelpImageUrl: 'campaignArchived help',
          alternativeTextToExternalIdHelpImage: 'campaignArchived alt help',
          customResultPageText: 'campaignArchived custom text',
          customResultPageButtonText: 'campaignArchived custom button',
          customResultPageButtonUrl: 'campaignArchived custom url',
          organizationId: activeOrganization.organization.id,
          deletedAt: null,
          deletedBy: null,
          archivedAt: new Date('2023-01-01'),
        });

        await databaseBuilder.commit();
      });

      it('should anonymise campaigns of archived organization before date', async function () {
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
        const campaignArchived = await knex('campaigns')
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
          .where('id', archivedOrganizationBeforeDate.campaignArchived.id)
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
          deletedAt: archivedOrganizationBeforeDate.campaignDeleted.deletedAt,
          deletedBy: userId,
          archivedAt: archivedOrganizationBeforeDate.organization.archivedAt,
        });
        expect(campaignArchived).deep.equal({
          name: '(anonymized)',
          title: null,
          customLandingPageText: null,
          externalIdHelpImageUrl: null,
          alternativeTextToExternalIdHelpImage: null,
          customResultPageText: null,
          customResultPageButtonText: null,
          customResultPageButtonUrl: null,
          deletedAt: now,
          deletedBy: ENGINEERING_USER_ID,
          archivedAt: archivedOrganizationBeforeDate.organization.archivedAt,
        });
      });

      it('should not anonymise campaigns of archived archived organization at date', async function () {
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
          name: 'campaignDeleted name',
          title: 'campaignDeleted title',
          customLandingPageText: 'campaignDeleted landing',
          externalIdHelpImageUrl: 'campaignDeleted help',
          alternativeTextToExternalIdHelpImage: 'campaignDeleted alt help',
          customResultPageText: 'campaignDeleted custom text',
          customResultPageButtonText: 'campaignDeleted custom button',
          customResultPageButtonUrl: 'campaignDeleted custom url',
          deletedAt: archivedOrganizationAtDate.campaignDeleted.deletedAt,
          deletedBy: userId,
          archivedAt: archivedOrganizationAtDate.campaignDeleted.archivedAt,
        });
      });

      describe('#learner & #participations', function () {
        beforeEach(async function () {
          // 1
          archivedOrganizationBeforeDate.activeLearner =
            databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
              firstName: 'johnny',
              lastName: 'five',
              organizationId: archivedOrganizationBeforeDate.organization.id,
              updatedAt: new Date('2024-01-25'),
            });

          // 2
          archivedOrganizationAtDate.activeLearner =
            databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearner({
              firstName: 'johnny',
              lastName: 'not be good',
              organizationId: archivedOrganizationAtDate.organization.id,
              updatedAt: new Date('2024-01-25'),
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
            archivedOrganizationBeforeDate.activeParticipation = databaseBuilder.factory.buildCampaignParticipation({
              userId: archivedOrganizationBeforeDate.activeLearner.userId,
              organizationLearnerId: archivedOrganizationBeforeDate.activeLearner.id,
              participantExternalId: 'another-learner',
              campaignId: archivedOrganizationBeforeDate.campaignArchived.id,
            });
            archivedOrganizationBeforeDate.deletedParticipation = databaseBuilder.factory.buildCampaignParticipation({
              userId: archivedOrganizationBeforeDate.activeLearner.userId,
              organizationLearnerId: archivedOrganizationBeforeDate.activeLearner.id,
              participantExternalId: 'another-learner',
              campaignId: archivedOrganizationBeforeDate.campaignDeleted.id,
              deletedAt: new Date('2023-01-01'),
              deletedBy: userId,
            });

            // 2
            archivedOrganizationAtDate.activeParticipation = databaseBuilder.factory.buildCampaignParticipation({
              userId: archivedOrganizationAtDate.activeLearner.userId,
              organizationLearnerId: archivedOrganizationAtDate.activeLearner.id,
              participantExternalId: 'second',
              campaignId: archivedOrganizationAtDate.campaignDeleted.id,
              deletedAt: null,
              deletedBy: null,
            });

            // 3
            activeOrganization.activeParticipation = databaseBuilder.factory.buildCampaignParticipation({
              userId: activeOrganization.activeLearner.userId,
              organizationLearnerId: activeOrganization.activeLearner.id,
              participantExternalId: 'second',
              campaignId: activeOrganization.campaignArchived.id,
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
            it('should anonymise and delete participation of archived organization before date', async function () {
              // when
              await script.handle({
                options: { startArchiveDate },
                logger,
              });

              const deletedParticipation = await knex('campaign-participations')
                .select('userId', 'participantExternalId', 'deletedAt', 'deletedBy')
                .where('id', archivedOrganizationBeforeDate.deletedParticipation.id)
                .first();

              const activeParticipation = await knex('campaign-participations')
                .select('userId', 'participantExternalId', 'deletedAt', 'deletedBy')
                .where('id', archivedOrganizationBeforeDate.activeParticipation.id)
                .first();

              // then
              expect(deletedParticipation).deep.equal({
                userId: null,
                participantExternalId: null,
                deletedAt: archivedOrganizationBeforeDate.deletedParticipation.deletedAt,
                deletedBy: userId,
              });
              expect(activeParticipation).deep.equal({
                userId: null,
                participantExternalId: null,
                deletedAt: now,
                deletedBy: ENGINEERING_USER_ID,
              });
            });

            it('should not anonymise or delete participation of archived organization at date', async function () {
              // when
              await script.handle({
                options: { startArchiveDate },
                logger,
              });

              const activeParticipation = await knex('campaign-participations')
                .select('userId', 'participantExternalId', 'deletedAt', 'deletedBy')
                .where('id', archivedOrganizationAtDate.activeParticipation.id)
                .first();

              // then
              expect(activeParticipation).deep.equal({
                userId: archivedOrganizationAtDate.activeParticipation.userId,
                participantExternalId: archivedOrganizationAtDate.activeParticipation.participantExternalId,
                deletedAt: null,
                deletedBy: null,
              });
            });

            it('should not anonymise or delete participation of active organization', async function () {
              // when
              await script.handle({
                options: { startArchiveDate },
                logger,
              });

              const deleteParticipation = await knex('campaign-participations')
                .select('userId', 'participantExternalId', 'deletedAt', 'deletedBy')
                .where('id', activeOrganization.deletedParticipation.id)
                .first();
              const activeParticipation = await knex('campaign-participations')
                .select('userId', 'participantExternalId', 'deletedAt', 'deletedBy')
                .where('id', activeOrganization.activeParticipation.id)
                .first();

              // then
              expect(deleteParticipation).deep.equal({
                userId: activeOrganization.deletedParticipation.userId,
                participantExternalId: activeOrganization.deletedParticipation.participantExternalId,
                deletedAt: activeOrganization.deletedParticipation.deletedAt,
                deletedBy: userId,
              });
              expect(activeParticipation).deep.equal({
                userId: activeOrganization.activeParticipation.userId,
                participantExternalId: activeOrganization.activeParticipation.participantExternalId,
                deletedAt: null,
                deletedBy: null,
              });
            });
          });

          describe('#assessments', function () {
            it('should detach assessments and update updatedAt column only on archived organization before date', async function () {
              // given
              // 1
              const assessment1 = databaseBuilder.factory.buildAssessment({
                userId: archivedOrganizationBeforeDate.activeLearner.userId,
                campaignParticipationId: archivedOrganizationBeforeDate.deletedParticipation.id,
              });
              const assessment2 = databaseBuilder.factory.buildAssessment({
                userId: archivedOrganizationBeforeDate.activeLearner.userId,
                campaignParticipationId: archivedOrganizationBeforeDate.activeParticipation.id,
              });

              // 2
              databaseBuilder.factory.buildAssessment({
                userId: archivedOrganizationAtDate.activeLearner.userId,
                campaignParticipationId: archivedOrganizationAtDate.activeParticipation.id,
              });

              // 3
              databaseBuilder.factory.buildAssessment({
                userId: activeOrganization.activeLearner.userId,
                campaignParticipationId: activeOrganization.activeParticipation.id,
              });

              await databaseBuilder.commit();

              // when
              await script.handle({ options: { startArchiveDate }, logger });

              const assessmentResults = await knex('assessments')
                .select('id')
                .where({ updatedAt: now })
                .whereNull('campaignParticipationId')
                .pluck('id');

              // then
              expect(assessmentResults).lengthOf(2);
              expect(assessmentResults).deep.members([assessment1.id, assessment2.id]);
            });
          });

          describe('#recommendedTrainings', function () {
            it('should detach user recommended trainings only on archived organization before date', async function () {
              // given
              const training = databaseBuilder.factory.buildTraining();
              const training2 = databaseBuilder.factory.buildTraining();

              // 1
              databaseBuilder.factory.buildUserRecommendedTraining({
                campaignParticipationId: archivedOrganizationBeforeDate.deletedParticipation.id,
                trainingId: training.id,
                userId: archivedOrganizationBeforeDate.activeLearner.userId,
              });
              databaseBuilder.factory.buildUserRecommendedTraining({
                campaignParticipationId: archivedOrganizationBeforeDate.deletedParticipation.id,
                trainingId: training2.id,
                userId: archivedOrganizationBeforeDate.activeLearner.userId,
              });

              // 2
              databaseBuilder.factory.buildUserRecommendedTraining({
                campaignParticipationId: archivedOrganizationAtDate.activeParticipation.id,
                trainingId: training2.id,
                userId: archivedOrganizationAtDate.activeLearner.userId,
                updatedAt: new Date('2024-01-01'),
              });

              // 3
              databaseBuilder.factory.buildUserRecommendedTraining({
                campaignParticipationId: activeOrganization.activeParticipation.id,
                trainingId: training2.id,
                userId: activeOrganization.activeLearner.userId,
                updatedAt: new Date('2023-01-01'),
              });

              await databaseBuilder.commit();

              // when
              await script.handle({ options: { startArchiveDate }, logger });

              const anonymisedRecommendedTrainingResults = await knex('user-recommended-trainings')
                .select('campaignParticipationId', 'userId', 'updatedAt')
                .whereNull('campaignParticipationId');

              const activeRecommendedTrainings = await knex('user-recommended-trainings')
                .select('campaignParticipationId', 'userId', 'updatedAt')
                .whereNotNull('campaignParticipationId');

              // then
              expect(anonymisedRecommendedTrainingResults).lengthOf(2);
              expect(anonymisedRecommendedTrainingResults).deep.members([
                {
                  campaignParticipationId: null,
                  userId: archivedOrganizationBeforeDate.activeLearner.userId,
                  updatedAt: now,
                },
                {
                  campaignParticipationId: null,
                  userId: archivedOrganizationBeforeDate.activeLearner.userId,
                  updatedAt: now,
                },
              ]);
              expect(activeRecommendedTrainings).lengthOf(2);
              expect(activeRecommendedTrainings).deep.members([
                {
                  campaignParticipationId: archivedOrganizationAtDate.activeParticipation.id,
                  userId: archivedOrganizationAtDate.activeLearner.userId,
                  updatedAt: new Date('2024-01-01'),
                },
                {
                  campaignParticipationId: activeOrganization.activeParticipation.id,
                  userId: activeOrganization.activeLearner.userId,
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

            it('should detach non certifiable badges only on archived organization before date', async function () {
              // given
              // 1
              databaseBuilder.factory.buildBadgeAcquisition({
                userId: archivedOrganizationBeforeDate.activeLearner.userId,
                badgeId: nonCertifiableBadge.id,
                campaignParticipationId: archivedOrganizationBeforeDate.deletedParticipation.id,
              });
              databaseBuilder.factory.buildBadgeAcquisition({
                userId: archivedOrganizationBeforeDate.activeLearner.userId,
                badgeId: nonCertifiableBadge.id,
                campaignParticipationId: archivedOrganizationBeforeDate.activeParticipation.id,
              });

              // 2
              databaseBuilder.factory.buildBadgeAcquisition({
                userId: archivedOrganizationAtDate.activeLearner.userId,
                badgeId: nonCertifiableBadge.id,
                campaignParticipationId: archivedOrganizationAtDate.activeParticipation.id,
              });

              // 3
              databaseBuilder.factory.buildBadgeAcquisition({
                userId: activeOrganization.activeLearner.userId,
                badgeId: nonCertifiableBadge.id,
                campaignParticipationId: activeOrganization.activeParticipation.id,
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
                  campaignParticipationId: archivedOrganizationBeforeDate.activeParticipation.id,
                },
                {
                  badgeId: nonCertifiableBadge.id,
                  campaignParticipationId: archivedOrganizationBeforeDate.deletedParticipation.id,
                },
              ]);
            });
            it('should not detach certifiable badge', async function () {
              // given
              databaseBuilder.factory.buildBadgeAcquisition({
                userId: archivedOrganizationBeforeDate.activeLearner.userId,
                badgeId: certifiableBadge.id,
                campaignParticipationId: archivedOrganizationBeforeDate.deletedParticipation.id,
              });
              databaseBuilder.factory.buildBadgeAcquisition({
                userId: archivedOrganizationBeforeDate.activeLearner.userId,
                badgeId: certifiableBadge.id,
                campaignParticipationId: archivedOrganizationBeforeDate.activeParticipation.id,
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
                  userId: archivedOrganizationBeforeDate.activeLearner.userId,
                },
                {
                  badgeId: certifiableBadge.id,
                  campaignParticipationId: archivedOrganizationBeforeDate.activeParticipation.id,
                  userId: archivedOrganizationBeforeDate.activeLearner.userId,
                },
              ]);
            });
          });
        });

        describe('#learners', function () {
          beforeEach(async function () {
            // 1
            archivedOrganizationBeforeDate.deletedLearner = databaseBuilder.factory.buildOrganizationLearner({
              organizationId: archivedOrganizationBeforeDate.organization.id,
              firstName: 'delete Learner before',
              lastName: 'delete learner before',
              preferredLastName: 'oui',
              middleName: 'non',
              thirdName: 'may be',
              birthdate: '2020-12-12',
              birthCity: 'can you repeat the question',
              birthCityCode: 1845,
              birthProvinceCode: '48A',
              birthCountryCode: '18AP',
              status: 'none',
              nationalStudentId: '156478',
              nationalApprenticeId: '1987878',
              division: '6B',
              sex: 'M',
              email: 'oui@oui.io',
              studentNumber: '54848978',
              department: '51',
              educationalTeam: 'no',
              group: '4e',
              diploma: 'food,beverage,sleep',
              updatedAt: new Date('2023-01-01'),
              deletedAt: new Date('2023-01-01'),
              deletedBy: userId,
            });

            // 2
            archivedOrganizationAtDate.deletedLearner = databaseBuilder.factory.buildOrganizationLearner({
              organizationId: archivedOrganizationAtDate.organization.id,
              firstName: 'delete learner at',
              lastName: 'delete learner at',
              preferredLastName: 'oui',
              middleName: 'non',
              thirdName: 'may be',
              birthdate: '2020-12-12',
              birthCity: 'can you repeat the question',
              birthCityCode: 1845,
              birthProvinceCode: '48A',
              birthCountryCode: '18AP',
              nationalStudentId: '156478',
              nationalApprenticeId: '1987878',
              division: '6B',
              sex: 'M',
              email: 'oui@oui.io',
              studentNumber: '54848978',
              department: '51',
              educationalTeam: 'no',
              group: '4e',
              diploma: 'food,beverage,sleep',
              updatedAt: new Date('2023-01-01'),
              deletedAt: new Date('2023-01-01'),
              deletedBy: userId,
            });

            await databaseBuilder.commit();
          });

          it('should delete and anonymise learner from archived organization before date', async function () {
            // when
            await script.handle({ options: { startArchiveDate }, logger });

            const anonymisedLearners = await knex('organization-learners')
              .select(
                'organizationId',
                'deletedAt',
                'deletedBy',
                'updatedAt',
                'firstName',
                'lastName',
                'preferredLastName',
                'middleName',
                'thirdName',
                'birthdate',
                'birthCity',
                'birthCityCode',
                'birthProvinceCode',
                'birthCountryCode',
                'nationalStudentId',
                'nationalApprenticeId',
                'division',
                'sex',
                'email',
                'studentNumber',
                'department',
                'educationalTeam',
                'group',
                'diploma',
              )
              .where({
                organizationId: archivedOrganizationBeforeDate.organization.id,
              });

            // then
            expect(anonymisedLearners).lengthOf(2);
            expect(anonymisedLearners).deep.members([
              {
                organizationId: archivedOrganizationBeforeDate.organization.id,
                firstName: '(anonymized)',
                lastName: '(anonymized)',
                preferredLastName: null,
                middleName: null,
                thirdName: null,
                birthdate: '2020-01-01',
                birthCity: null,
                birthCityCode: null,
                birthProvinceCode: null,
                birthCountryCode: null,
                nationalStudentId: null,
                nationalApprenticeId: null,
                division: null,
                sex: null,
                email: null,
                studentNumber: null,
                department: null,
                educationalTeam: null,
                group: null,
                diploma: null,
                updatedAt: now,
                deletedAt: new Date('2023-01-01'),
                deletedBy: userId,
              },
              {
                organizationId: archivedOrganizationBeforeDate.organization.id,
                firstName: '(anonymized)',
                lastName: '(anonymized)',
                preferredLastName: null,
                middleName: null,
                thirdName: null,
                birthdate: null,
                birthCity: null,
                birthCityCode: null,
                birthProvinceCode: null,
                birthCountryCode: null,
                nationalStudentId: null,
                nationalApprenticeId: null,
                division: null,
                sex: null,
                email: null,
                studentNumber: null,
                department: null,
                educationalTeam: null,
                group: null,
                diploma: null,
                updatedAt: now,
                deletedAt: now,
                deletedBy: ENGINEERING_USER_ID,
              },
            ]);
          });

          it('should not delete or anonymise learner from archived organization at date', async function () {
            // when
            await script.handle({ options: { startArchiveDate }, logger });

            const availableLearners = await knex('organization-learners')
              .select(
                'firstName',
                'lastName',
                'organizationId',
                'preferredLastName',
                'middleName',
                'thirdName',
                'birthdate',
                'birthCity',
                'birthCityCode',
                'birthProvinceCode',
                'birthCountryCode',
                'nationalStudentId',
                'nationalApprenticeId',
                'division',
                'sex',
                'email',
                'studentNumber',
                'department',
                'educationalTeam',
                'group',
                'diploma',
                'deletedAt',
                'deletedBy',
                'updatedAt',
              )
              .where({
                organizationId: archivedOrganizationAtDate.organization.id,
              });

            // then
            expect(availableLearners).lengthOf(2);
            expect(availableLearners).deep.members([
              {
                organizationId: archivedOrganizationAtDate.organization.id,
                firstName: 'delete learner at',
                lastName: 'delete learner at',
                preferredLastName: 'oui',
                middleName: 'non',
                thirdName: 'may be',
                birthdate: '2020-12-12',
                birthCity: 'can you repeat the question',
                birthCityCode: '1845',
                birthProvinceCode: '48A',
                birthCountryCode: '18AP',
                nationalStudentId: '156478',
                nationalApprenticeId: '1987878',
                division: '6B',
                sex: 'M',
                email: 'oui@oui.io',
                studentNumber: '54848978',
                department: '51',
                educationalTeam: 'no',
                group: '4e',
                diploma: 'food,beverage,sleep',
                deletedAt: archivedOrganizationAtDate.deletedLearner.deletedAt,
                deletedBy: archivedOrganizationAtDate.deletedLearner.deletedBy,
                updatedAt: archivedOrganizationAtDate.deletedLearner.updatedAt,
              },
              {
                firstName: 'johnny',
                lastName: 'not be good',
                organizationId: archivedOrganizationAtDate.organization.id,
                preferredLastName: null,
                middleName: null,
                thirdName: null,
                birthdate: null,
                birthCity: null,
                birthCityCode: null,
                birthProvinceCode: null,
                birthCountryCode: null,
                nationalStudentId: null,
                nationalApprenticeId: null,
                division: null,
                sex: null,
                email: null,
                studentNumber: null,
                department: null,
                educationalTeam: null,
                group: null,
                diploma: null,
                deletedAt: null,
                deletedBy: null,
                updatedAt: archivedOrganizationAtDate.activeLearner.updatedAt,
              },
            ]);
          });

          describe('#profileReward', function () {
            let activeProfileRewardId;
            beforeEach(async function () {
              // 1
              const deletedProfileRewardId = databaseBuilder.factory.buildProfileReward({
                userId: archivedOrganizationBeforeDate.activeLearner.userId,
                rewardType: 'POUET',
                rewardId: 10,
              }).id;
              databaseBuilder.factory.buildOrganizationsProfileRewards({
                organizationId: archivedOrganizationBeforeDate.organization.id,
                profileRewardId: deletedProfileRewardId,
              });

              // 2
              activeProfileRewardId = databaseBuilder.factory.buildProfileReward({
                userId: archivedOrganizationAtDate.activeLearner.userId,
                rewardType: 'POUAT',
                rewardId: 11,
              }).id;
              databaseBuilder.factory.buildOrganizationsProfileRewards({
                organizationId: archivedOrganizationAtDate.organization.id,
                profileRewardId: activeProfileRewardId,
              });

              await databaseBuilder.commit();
            });

            it('should remove organization profile reward for learner linked to archived organization before', async function () {
              // when
              await script.handle({ options: { startArchiveDate }, logger });

              const detachedProfileReward = await knex('organizations-profile-rewards').whereNull('profileRewardId');

              // then
              expect(detachedProfileReward).length(1);
              expect(detachedProfileReward[0].organizationId).equal(archivedOrganizationBeforeDate.organization.id);
            });

            it('should not remove organization profile reward for learner linked to archived organization at', async function () {
              // when
              await script.handle({ options: { startArchiveDate }, logger });

              const attachedProfileReward = await knex('organizations-profile-rewards').whereNotNull('profileRewardId');

              // then
              expect(attachedProfileReward).length(1);
              expect(attachedProfileReward[0].organizationId).equal(archivedOrganizationAtDate.organization.id);
            });
          });
        });
      });
    });
  });
});
