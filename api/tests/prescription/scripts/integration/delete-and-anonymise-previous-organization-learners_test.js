import { expect } from 'chai';
import sinon from 'sinon';

import { DeleteAndAnonymisePreviousOrganizationLearnersScript } from '../../../../src/prescription/scripts/delete-and-anonymise-previous-organization-learners.js';
import { databaseBuilder, knex } from '../../../tooling/databases.js';

describe('DeleteAndAnonymisePreviousOrganizationLearnersScript', function () {
  describe('Options', function () {
    it('has the correct options', function () {
      const script = new DeleteAndAnonymisePreviousOrganizationLearnersScript();
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
      deletedLearner: null,
      deletedParticipation: null,
    };

    const archivedOrganizationAtDate = {
      organization: null,
      deletedLearner: null,
      deletedLearnerAtDate: null,
      deletedParticipation: null,
    };

    const activeOrganization = {
      organization: null,
      campaignDeleted: null,
      campaignActive: null,
      activeLearner: null,
      deletedLearner: null,
      activeParticipation: null,
      deletedParticipation: null,
    };

    beforeEach(async function () {
      script = new DeleteAndAnonymisePreviousOrganizationLearnersScript();
      logger = { info: sinon.spy(), error: sinon.spy() };
      sinon.stub(process, 'env').value({ ENGINEERING_USER_ID });
      now = new Date(startArchiveDate);
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });

      userId = databaseBuilder.factory.buildUser({
        id: ENGINEERING_USER_ID,
      }).id;

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

    describe('#learner & #participations', function () {
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
          birthCityCode: '1845',
          birthProvinceCode: '48A',
          birthCountryCode: '18AP',
          status: 'none',
          nationalStudentId: '1',
          nationalApprenticeId: '1',
          division: '6B',
          sex: 'M',
          email: 'oui@oui.io',
          studentNumber: '1',
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
          birthCityCode: '1845',
          birthProvinceCode: '48A',
          birthCountryCode: '18AP',
          nationalStudentId: '2',
          nationalApprenticeId: '2',
          division: '6B',
          sex: 'M',
          email: 'oui@oui.io',
          studentNumber: '2',
          department: '51',
          educationalTeam: 'no',
          group: '4e',
          diploma: 'food,beverage,sleep',
          updatedAt: new Date('2023-01-01'),
          deletedAt: new Date('2023-01-01'),
          deletedBy: userId,
        });

        archivedOrganizationAtDate.deletedLearnerAtDate = databaseBuilder.factory.buildOrganizationLearner({
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
          nationalStudentId: '5',
          nationalApprenticeId: '5',
          division: '6B',
          sex: 'M',
          email: 'oui@oui.io',
          studentNumber: '5',
          department: '51',
          educationalTeam: 'no',
          group: '4e',
          diploma: 'food,beverage,sleep',
          updatedAt: now,
          deletedAt: now,
          deletedBy: userId,
        });

        // 3
        activeOrganization.activeLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: activeOrganization.organization.id,
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
          nationalStudentId: '3',
          nationalApprenticeId: '3',
          division: '6B',
          sex: 'M',
          email: 'non@non.io',
          studentNumber: '3',
          department: '51',
          educationalTeam: 'no',
          group: '4e',
          diploma: 'food,beverage,sleep',
          updatedAt: new Date('2023-01-01'),
          deletedAt: null,
          deletedBy: null,
        });

        activeOrganization.deletedLearner = databaseBuilder.factory.buildOrganizationLearner({
          organizationId: activeOrganization.organization.id,
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
          nationalStudentId: '4',
          nationalApprenticeId: '4',
          division: '6B',
          sex: 'M',
          email: 'oui@oui.io',
          studentNumber: '4',
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

      describe('#learners', function () {
        describe('#archivedOrganizationBeforeDate', function () {
          it('not update delete learner from archived organization before date', async function () {
            // when
            await script.handle({ options: { startArchiveDate }, logger });

            const learnersFromArchivedOrganizationBeforeDate = await knex('organization-learners')
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
            expect(learnersFromArchivedOrganizationBeforeDate).lengthOf(1);
            expect(learnersFromArchivedOrganizationBeforeDate).deep.members([
              {
                organizationId: archivedOrganizationBeforeDate.organization.id,
                firstName: archivedOrganizationBeforeDate.deletedLearner.firstName,
                lastName: archivedOrganizationBeforeDate.deletedLearner.lastName,
                preferredLastName: archivedOrganizationBeforeDate.deletedLearner.preferredLastName,
                middleName: archivedOrganizationBeforeDate.deletedLearner.middleName,
                thirdName: archivedOrganizationBeforeDate.deletedLearner.thirdName,
                birthdate: archivedOrganizationBeforeDate.deletedLearner.birthdate,
                birthCity: archivedOrganizationBeforeDate.deletedLearner.birthCity,
                birthCityCode: archivedOrganizationBeforeDate.deletedLearner.birthCityCode,
                birthProvinceCode: archivedOrganizationBeforeDate.deletedLearner.birthProvinceCode,
                birthCountryCode: archivedOrganizationBeforeDate.deletedLearner.birthCountryCode,
                nationalStudentId: archivedOrganizationBeforeDate.deletedLearner.nationalStudentId,
                nationalApprenticeId: archivedOrganizationBeforeDate.deletedLearner.nationalApprenticeId,
                division: archivedOrganizationBeforeDate.deletedLearner.division,
                sex: archivedOrganizationBeforeDate.deletedLearner.sex,
                email: archivedOrganizationBeforeDate.deletedLearner.email,
                studentNumber: archivedOrganizationBeforeDate.deletedLearner.studentNumber,
                department: archivedOrganizationBeforeDate.deletedLearner.department,
                educationalTeam: archivedOrganizationBeforeDate.deletedLearner.educationalTeam,
                group: archivedOrganizationBeforeDate.deletedLearner.group,
                diploma: archivedOrganizationBeforeDate.deletedLearner.diploma,
                updatedAt: archivedOrganizationBeforeDate.deletedLearner.updatedAt,
                deletedAt: archivedOrganizationBeforeDate.deletedLearner.deletedAt,
                deletedBy: archivedOrganizationBeforeDate.deletedLearner.deletedBy,
              },
            ]);
          });
        });

        describe('#archivedOrganizationAtDate', function () {
          it('should anonymise deleted learner before date from archived organization at date', async function () {
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
                id: archivedOrganizationAtDate.deletedLearner.id,
              });

            // then
            expect(availableLearners).lengthOf(1);
            expect(availableLearners).deep.members([
              {
                firstName: '(anonymized)',
                lastName: '(anonymized)',
                organizationId: archivedOrganizationAtDate.organization.id,
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
                deletedAt: archivedOrganizationAtDate.deletedLearner.deletedAt,
                deletedBy: archivedOrganizationAtDate.deletedLearner.deletedBy,
                updatedAt: now,
              },
            ]);
          });

          it('should not anonymise deleted learner at date from archived organization at date', async function () {
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
                id: archivedOrganizationAtDate.deletedLearnerAtDate.id,
              });

            // then
            expect(availableLearners).lengthOf(1);
            expect(availableLearners).deep.members([
              {
                firstName: archivedOrganizationAtDate.deletedLearnerAtDate.firstName,
                lastName: archivedOrganizationAtDate.deletedLearnerAtDate.lastName,
                organizationId: archivedOrganizationAtDate.deletedLearnerAtDate.organizationId,
                preferredLastName: archivedOrganizationAtDate.deletedLearnerAtDate.preferredLastName,
                middleName: archivedOrganizationAtDate.deletedLearnerAtDate.middleName,
                thirdName: archivedOrganizationAtDate.deletedLearnerAtDate.thirdName,
                birthdate: archivedOrganizationAtDate.deletedLearnerAtDate.birthdate,
                birthCity: archivedOrganizationAtDate.deletedLearnerAtDate.birthCity,
                birthCityCode: archivedOrganizationAtDate.deletedLearnerAtDate.birthCityCode,
                birthProvinceCode: archivedOrganizationAtDate.deletedLearnerAtDate.birthProvinceCode,
                birthCountryCode: archivedOrganizationAtDate.deletedLearnerAtDate.birthCountryCode,
                nationalStudentId: archivedOrganizationAtDate.deletedLearnerAtDate.nationalStudentId,
                nationalApprenticeId: archivedOrganizationAtDate.deletedLearnerAtDate.nationalApprenticeId,
                division: archivedOrganizationAtDate.deletedLearnerAtDate.division,
                sex: archivedOrganizationAtDate.deletedLearnerAtDate.sex,
                email: archivedOrganizationAtDate.deletedLearnerAtDate.email,
                studentNumber: archivedOrganizationAtDate.deletedLearnerAtDate.studentNumber,
                department: archivedOrganizationAtDate.deletedLearnerAtDate.department,
                educationalTeam: archivedOrganizationAtDate.deletedLearnerAtDate.educationalTeam,
                group: archivedOrganizationAtDate.deletedLearnerAtDate.group,
                diploma: archivedOrganizationAtDate.deletedLearnerAtDate.diploma,
                deletedAt: archivedOrganizationAtDate.deletedLearnerAtDate.deletedAt,
                deletedBy: archivedOrganizationAtDate.deletedLearnerAtDate.deletedBy,
                updatedAt: archivedOrganizationAtDate.deletedLearnerAtDate.updatedAt,
              },
            ]);
          });
        });

        describe('#activeOrganization', function () {
          it('should anonymise deleted learner before date from active organization', async function () {
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
                id: activeOrganization.deletedLearner.id,
              });

            // then
            expect(availableLearners).lengthOf(1);
            expect(availableLearners).deep.members([
              {
                firstName: '(anonymized)',
                lastName: '(anonymized)',
                organizationId: activeOrganization.organization.id,
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
                deletedAt: activeOrganization.deletedLearner.deletedAt,
                deletedBy: activeOrganization.deletedLearner.deletedBy,
                updatedAt: now,
              },
            ]);
          });

          it('should not anonymise active learner from active organization', async function () {
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
                id: activeOrganization.activeLearner.id,
              });

            // then
            expect(availableLearners).lengthOf(1);
            expect(availableLearners).deep.members([
              {
                firstName: activeOrganization.activeLearner.firstName,
                lastName: activeOrganization.activeLearner.lastName,
                organizationId: activeOrganization.activeLearner.organizationId,
                preferredLastName: activeOrganization.activeLearner.preferredLastName,
                middleName: activeOrganization.activeLearner.middleName,
                thirdName: activeOrganization.activeLearner.thirdName,
                birthdate: activeOrganization.activeLearner.birthdate,
                birthCity: activeOrganization.activeLearner.birthCity,
                birthCityCode: activeOrganization.activeLearner.birthCityCode,
                birthProvinceCode: activeOrganization.activeLearner.birthProvinceCode,
                birthCountryCode: activeOrganization.activeLearner.birthCountryCode,
                nationalStudentId: activeOrganization.activeLearner.nationalStudentId,
                nationalApprenticeId: activeOrganization.activeLearner.nationalApprenticeId,
                division: activeOrganization.activeLearner.division,
                sex: activeOrganization.activeLearner.sex,
                email: activeOrganization.activeLearner.email,
                studentNumber: activeOrganization.activeLearner.studentNumber,
                department: activeOrganization.activeLearner.department,
                educationalTeam: activeOrganization.activeLearner.educationalTeam,
                group: activeOrganization.activeLearner.group,
                diploma: activeOrganization.activeLearner.diploma,
                deletedAt: activeOrganization.activeLearner.deletedAt,
                deletedBy: activeOrganization.activeLearner.deletedBy,
                updatedAt: activeOrganization.activeLearner.updatedAt,
              },
            ]);
          });
        });

        describe('#profileReward', function () {
          let activeProfileRewardIdFromActiveLearnerActiveOrganization, archivedOrganizationProfileRewardId;
          beforeEach(async function () {
            // 1
            archivedOrganizationProfileRewardId = databaseBuilder.factory.buildProfileReward({
              userId: archivedOrganizationBeforeDate.deletedLearner.userId,
              rewardType: 'POUET',
              rewardId: 12,
            }).id;
            databaseBuilder.factory.buildOrganizationsProfileRewards({
              organizationId: archivedOrganizationBeforeDate.organization.id,
              profileRewardId: archivedOrganizationProfileRewardId,
            });

            // 2
            const archvivedOrganizationAtDateProfileRewardId = databaseBuilder.factory.buildProfileReward({
              userId: archivedOrganizationAtDate.deletedLearner.userId,
              rewardType: 'POUOT',
              rewardId: 13,
            }).id;
            databaseBuilder.factory.buildOrganizationsProfileRewards({
              organizationId: archivedOrganizationAtDate.organization.id,
              profileRewardId: archvivedOrganizationAtDateProfileRewardId,
            });

            // 3
            activeProfileRewardIdFromActiveLearnerActiveOrganization = databaseBuilder.factory.buildProfileReward({
              userId: activeOrganization.activeLearner.userId,
              rewardType: 'POUAT',
              rewardId: 14,
            }).id;
            databaseBuilder.factory.buildOrganizationsProfileRewards({
              organizationId: activeOrganization.organization.id,
              profileRewardId: activeProfileRewardIdFromActiveLearnerActiveOrganization,
            });

            const deletedProfileRewardId = databaseBuilder.factory.buildProfileReward({
              userId: activeOrganization.deletedLearner.userId,
              rewardType: 'POUIT',
              rewardId: 15,
            }).id;
            databaseBuilder.factory.buildOrganizationsProfileRewards({
              organizationId: activeOrganization.organization.id,
              profileRewardId: deletedProfileRewardId,
            });

            await databaseBuilder.commit();
          });

          it('should not remove organization profile reward for learner linked to archived organization before', async function () {
            // when
            await script.handle({ options: { startArchiveDate }, logger });

            const attachedProfileReward = await knex('organizations-profile-rewards').select('profileRewardId').where({
              organizationId: archivedOrganizationBeforeDate.organization.id,
            });

            // then
            expect(attachedProfileReward).length(1);
            expect(attachedProfileReward[0].profileRewardId).equal(archivedOrganizationProfileRewardId);
          });

          it('should remove organization profile reward for learner linked to archived organization at', async function () {
            // when
            await script.handle({ options: { startArchiveDate }, logger });

            const attachedProfileReward = await knex('organizations-profile-rewards').select('profileRewardId').where({
              organizationId: archivedOrganizationAtDate.organization.id,
            });

            // then
            expect(attachedProfileReward).length(1);
            expect(attachedProfileReward[0].profileRewardId).null;
          });

          it('should remove organization profile reward for deleted learner linked to active organization', async function () {
            // when
            await script.handle({ options: { startArchiveDate }, logger });

            const attachedProfileReward = await knex('organizations-profile-rewards').select('profileRewardId').where({
              organizationId: activeOrganization.organization.id,
            });

            // then
            expect(attachedProfileReward).length(2);
            expect(attachedProfileReward).deep.members([
              { profileRewardId: null },
              {
                profileRewardId: activeProfileRewardIdFromActiveLearnerActiveOrganization,
              },
            ]);
          });
        });

        describe('#participations', function () {
          beforeEach(async function () {
            // 1
            archivedOrganizationBeforeDate.deletedParticipation = databaseBuilder.factory.buildCampaignParticipation({
              userId: archivedOrganizationBeforeDate.deletedLearner.userId,
              organizationLearnerId: archivedOrganizationBeforeDate.deletedLearner.id,
              participantExternalId: 'another-learner',
              deletedAt: new Date('2023-01-01'),
              deletedBy: userId,
            });

            // 2
            archivedOrganizationAtDate.deletedParticipation = databaseBuilder.factory.buildCampaignParticipation({
              userId: archivedOrganizationAtDate.deletedLearner.userId,
              organizationLearnerId: archivedOrganizationAtDate.deletedLearner.id,
              participantExternalId: 'second',
              deletedAt: new Date('2024-01-01'),
              deletedBy: userId,
            });

            // 3
            activeOrganization.activeParticipation = databaseBuilder.factory.buildCampaignParticipation({
              userId: activeOrganization.deletedLearner.userId,
              organizationLearnerId: activeOrganization.deletedLearner.id,
              participantExternalId: 'second',
              deletedAt: null,
              deletedBy: null,
            });

            activeOrganization.deletedParticipation = databaseBuilder.factory.buildCampaignParticipation({
              userId: activeOrganization.deletedLearner.userId,
              organizationLearnerId: activeOrganization.deletedLearner.id,
              participantExternalId: 'second',
              deletedAt: new Date('2023-01-01'),
              deletedBy: userId,
            });

            activeOrganization.deletedParticipationActiveLearner = databaseBuilder.factory.buildCampaignParticipation({
              userId: activeOrganization.activeLearner.userId,
              organizationLearnerId: activeOrganization.activeLearner.id,
              participantExternalId: 'thirsd',
              deletedAt: new Date('2023-01-01'),
              deletedBy: userId,
            });

            await databaseBuilder.commit();
          });

          describe('#archivedOrganizationBeforeDate', function () {
            it('should not anonymise, delete participation', async function () {
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
            it('should anonymise, previous deleted participation', async function () {
              // when
              await script.handle({
                options: { startArchiveDate },
                logger,
              });

              const activeParticipation = await knex('campaign-participations')
                .select('userId', 'participantExternalId', 'deletedAt', 'deletedBy')
                .where('id', archivedOrganizationAtDate.deletedParticipation.id)
                .first();

              // then
              expect(activeParticipation).deep.equal({
                userId: null,
                participantExternalId: null,
                deletedAt: archivedOrganizationAtDate.deletedParticipation.deletedAt,
                deletedBy: archivedOrganizationAtDate.deletedParticipation.deletedBy,
              });
            });
          });

          describe('#activeOrganization', function () {
            it('should anonymise deleted participation of deleted learner on active organization', async function () {
              // when
              await script.handle({
                options: { startArchiveDate },
                logger,
              });

              const deleteParticipation = await knex('campaign-participations')
                .select('userId', 'participantExternalId', 'deletedAt', 'deletedBy')
                .where('organizationLearnerId', activeOrganization.deletedLearner.id)
                .whereNotNull('deletedAt');

              // then
              expect(deleteParticipation).deep.members([
                {
                  userId: null,
                  participantExternalId: null,
                  deletedAt: activeOrganization.deletedParticipation.deletedAt,
                  deletedBy: activeOrganization.deletedParticipation.deletedBy,
                },
                {
                  userId: null,
                  participantExternalId: null,
                  deletedAt: now,
                  deletedBy: ENGINEERING_USER_ID,
                },
              ]);
            });
          });

          describe('#assessments', function () {
            it('should detach assessments and update updatedAt column only deleted learner before date not related to archived organization before date', async function () {
              // given
              // 1
              databaseBuilder.factory.buildAssessment({
                userId: archivedOrganizationBeforeDate.deletedParticipation.userId,
                campaignParticipationId: archivedOrganizationBeforeDate.deletedParticipation.id,
              });

              // 2
              const assessment1 = databaseBuilder.factory.buildAssessment({
                userId: archivedOrganizationAtDate.deletedParticipation.userId,
                campaignParticipationId: archivedOrganizationAtDate.deletedParticipation.id,
              });

              // 3
              databaseBuilder.factory.buildAssessment({
                userId: activeOrganization.deletedParticipationActiveLearner.userId,
                campaignParticipationId: activeOrganization.deletedParticipationActiveLearner.id,
              });

              const assessment2 = databaseBuilder.factory.buildAssessment({
                userId: activeOrganization.deletedParticipation.userId,
                campaignParticipationId: activeOrganization.deletedParticipation.id,
              });

              const assessment3 = databaseBuilder.factory.buildAssessment({
                userId: activeOrganization.activeParticipation.userId,
                campaignParticipationId: activeOrganization.activeParticipation.id,
              });

              await databaseBuilder.commit();

              // when
              await script.handle({ options: { startArchiveDate }, logger });

              const assessmentResults = await knex('assessments')
                .select('id', 'userId')
                .where({ updatedAt: now })
                .whereNull('campaignParticipationId');

              // then
              expect(assessmentResults).lengthOf(3);
              expect(assessmentResults).deep.members([
                {
                  id: assessment1.id,
                  userId: archivedOrganizationAtDate.deletedLearner.userId,
                },
                {
                  id: assessment2.id,
                  userId: activeOrganization.deletedLearner.userId,
                },
                {
                  id: assessment3.id,
                  userId: activeOrganization.deletedLearner.userId,
                },
              ]);
            });
          });

          describe('#recommendedTrainings', function () {
            it('should detach user recommended trainings only on deleted learner before date and not related to archived organization before date', async function () {
              // given
              const training = databaseBuilder.factory.buildTraining();
              const training2 = databaseBuilder.factory.buildTraining();

              // 1
              databaseBuilder.factory.buildUserRecommendedTraining({
                campaignParticipationId: archivedOrganizationBeforeDate.deletedParticipation.id,
                trainingId: training.id,
                userId: archivedOrganizationBeforeDate.deletedLearner.userId,
              });

              // 2
              databaseBuilder.factory.buildUserRecommendedTraining({
                campaignParticipationId: archivedOrganizationAtDate.deletedParticipation.id,
                trainingId: training2.id,
                userId: archivedOrganizationAtDate.deletedParticipation.userId,
                updatedAt: new Date('2024-01-01'),
              });

              // 3
              databaseBuilder.factory.buildUserRecommendedTraining({
                campaignParticipationId: activeOrganization.activeParticipation.id,
                trainingId: training2.id,
                userId: activeOrganization.activeParticipation.userId,
                updatedAt: new Date('2023-01-01'),
              });
              databaseBuilder.factory.buildUserRecommendedTraining({
                campaignParticipationId: activeOrganization.deletedParticipationActiveLearner.id,
                trainingId: training2.id,
                userId: activeOrganization.deletedParticipationActiveLearner.userId,
                updatedAt: new Date('2023-01-01'),
              });
              databaseBuilder.factory.buildUserRecommendedTraining({
                campaignParticipationId: activeOrganization.deletedParticipation.id,
                trainingId: training2.id,
                userId: activeOrganization.deletedParticipation.userId,
                updatedAt: new Date('2023-01-01'),
              });

              await databaseBuilder.commit();

              // when
              await script.handle({ options: { startArchiveDate }, logger });

              const anonymisedRecommendedTrainingResults = await knex('user-recommended-trainings')
                .select('campaignParticipationId', 'userId', 'updatedAt')
                .whereNull('campaignParticipationId');

              // then
              expect(anonymisedRecommendedTrainingResults).lengthOf(3);
              expect(anonymisedRecommendedTrainingResults).deep.members([
                {
                  campaignParticipationId: null,
                  userId: archivedOrganizationAtDate.deletedParticipation.userId,
                  updatedAt: now,
                },
                {
                  campaignParticipationId: null,
                  userId: activeOrganization.activeParticipation.userId,
                  updatedAt: now,
                },
                {
                  campaignParticipationId: null,
                  userId: activeOrganization.deletedParticipation.userId,
                  updatedAt: now,
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
                userId: archivedOrganizationBeforeDate.deletedParticipation.userId,
                badgeId: nonCertifiableBadge.id,
                campaignParticipationId: archivedOrganizationBeforeDate.deletedParticipation.id,
              });

              // 2
              databaseBuilder.factory.buildBadgeAcquisition({
                userId: archivedOrganizationAtDate.deletedParticipation.userId,
                badgeId: nonCertifiableBadge.id,
                campaignParticipationId: archivedOrganizationAtDate.deletedParticipation.id,
              });

              // 3
              databaseBuilder.factory.buildBadgeAcquisition({
                userId: activeOrganization.deletedParticipationActiveLearner.userId,
                badgeId: nonCertifiableBadge.id,
                campaignParticipationId: activeOrganization.deletedParticipationActiveLearner.id,
              });

              databaseBuilder.factory.buildBadgeAcquisition({
                userId: activeOrganization.deletedParticipation.userId,
                badgeId: nonCertifiableBadge.id,
                campaignParticipationId: activeOrganization.deletedParticipation.id,
              });

              databaseBuilder.factory.buildBadgeAcquisition({
                userId: activeOrganization.activeParticipation.userId,
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
              expect(detachBadges).lengthOf(3);
              expect(detachBadges).deep.members([
                {
                  badgeId: nonCertifiableBadge.id,
                  campaignParticipationId: archivedOrganizationAtDate.deletedParticipation.id,
                },
                {
                  badgeId: nonCertifiableBadge.id,
                  campaignParticipationId: activeOrganization.deletedParticipation.id,
                },
                {
                  badgeId: nonCertifiableBadge.id,
                  campaignParticipationId: activeOrganization.activeParticipation.id,
                },
              ]);
            });
            it('should not detach certifiable badge', async function () {
              // given
              databaseBuilder.factory.buildBadgeAcquisition({
                userId: activeOrganization.deletedParticipation.userId,
                badgeId: certifiableBadge.id,
                campaignParticipationId: activeOrganization.deletedParticipation.id,
              });
              databaseBuilder.factory.buildBadgeAcquisition({
                userId: activeOrganization.activeParticipation.userId,
                badgeId: certifiableBadge.id,
                campaignParticipationId: activeOrganization.activeParticipation.id,
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
                  campaignParticipationId: activeOrganization.deletedParticipation.id,
                  userId: activeOrganization.deletedParticipation.userId,
                },
                {
                  badgeId: certifiableBadge.id,
                  campaignParticipationId: activeOrganization.activeParticipation.id,
                  userId: activeOrganization.activeParticipation.userId,
                },
              ]);
            });
          });
        });
      });
    });
  });
});
