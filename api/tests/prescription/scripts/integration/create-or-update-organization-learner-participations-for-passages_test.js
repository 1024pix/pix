import { CreateOrUpdateOrganizationLearnerParticipationsForPassages } from '../../../../src/prescription/scripts/create-or-update-organization-learner-participations-for-passages.js';
import {
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../src/quest/domain/models/OrganizationLearnerParticipation.js';
import { databaseBuilder, expect, knex, nock, sinon } from '../../../test-helper.js';

describe('Integration | Prescription | Script | Prod | create-or-update-organization-learner-participations-for-passages', function () {
  let script, loggerStub;

  beforeEach(function () {
    nock('https://assets.pix.org').persist().head(/^.+$/).reply(200, {});
    script = new CreateOrUpdateOrganizationLearnerParticipationsForPassages();
    loggerStub = { info: sinon.stub(), error: sinon.stub() };
  });

  describe('Options', function () {
    it('has the correct options', function () {
      const { options } = script.metaInfo;
      expect(options.dryRun).to.deep.include({
        type: 'boolean',
        describe: 'execute script without commit',
        demandOption: false,
        default: true,
      });
    });
  });

  describe('when organizationLeanerId of combined_course_participations is linked to organization_learner_participations of type PASSAGES', function () {
    beforeEach(async function () {
      // First learner with combined course participations
      const { id: organizationLearner1Id, organizationId: organization1Id } =
        databaseBuilder.factory.buildOrganizationLearner();
      const { questId: ques1tId } = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBINED_COURSE_1',
        organizationId: organization1Id,
      });
      databaseBuilder.factory.buildCombinedCourseParticipation({
        combinedCourseId: null,
        questId: ques1tId,
        organizationLearnerId: organizationLearner1Id,
      });

      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId: organizationLearner1Id,
        type: OrganizationLearnerParticipationTypes.PASSAGE,
        status: OrganizationLearnerParticipationStatuses.STARTED,
        moduleId: 'abcde-1234',
        createdAt: new Date('2024-01-01'),

        addAttributes: false,
      });

      // Second learner with combined course participations
      const { id: organizationLearner2Id, organizationId: organization2Id } =
        databaseBuilder.factory.buildOrganizationLearner();
      const { questId: quest2Id } = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBINED_COURSE_2',
        organizationId: organization2Id,
      });
      databaseBuilder.factory.buildCombinedCourseParticipation({
        combinedCourseId: null,
        questId: quest2Id,
        organizationLearnerId: organizationLearner2Id,
      });

      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        organizationLearnerId: organizationLearner2Id,
        type: OrganizationLearnerParticipationTypes.PASSAGE,
        status: OrganizationLearnerParticipationStatuses.STARTED,
        moduleId: 'abcde-4567',
        createdAt: new Date('2024-02-01'),
        addAttributes: false,
      });

      await databaseBuilder.commit();
    });

    it('should delete older rows of organization_learner_participations of type PASSAGES without attributes', async function () {
      // when
      await script.handle({ options: { dryRun: false }, logger: loggerStub });

      // Then
      const result = await knex('organization_learner_participations').where({
        type: OrganizationLearnerParticipationTypes.PASSAGE,
      });

      expect(result).lengthOf(0);
    });
  });

  describe('when organizationLeanerId of combined_course_participations is not linked to organization_learner_participations of type PASSAGES', function () {
    const moduleId1 = '6282925d-4775-4bca-b513-4c3009ec5886';
    const moduleId2 = '654c44dc-0560-4acc-9860-4a67c923577f';
    const moduleId3 = 'f7b3a2e1-0d5c-4c6c-9c4d-1a3d8f7e9f5d';
    let organizationLearner1, organizationLearnerId2;
    beforeEach(async function () {
      // First learner with combined course participations
      organizationLearner1 = databaseBuilder.factory.buildOrganizationLearner();
      const { id: campaign1Id } = databaseBuilder.factory.buildCampaign({
        organizationId: organizationLearner1.organizationId,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1Id,
        userId: organizationLearner1.userId,
        organizationLearnerId: organizationLearner1.id,
        status: 'SHARED',
      });
      const { questId: ques1tId } = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBINED_COURSE_1',
        organizationId: organizationLearner1.organizationId,
        successRequirements: [
          {
            requirement_type: 'campaignParticipations',
            comparison: 'all',
            data: {
              campaignId: {
                data: campaign1Id,
                comparison: 'equal',
              },
              status: {
                data: 'SHARED',
                comparison: 'equal',
              },
            },
          },
          {
            requirement_type: 'passages',
            comparison: 'all',
            data: {
              moduleId: {
                data: moduleId1,
                comparison: 'equal',
              },
              isTerminated: {
                data: true,
                comparison: 'equal',
              },
            },
          },
          {
            requirement_type: 'passages',
            comparison: 'all',
            data: {
              moduleId: {
                data: moduleId3,
                comparison: 'equal',
              },
              isTerminated: {
                data: true,
                comparison: 'equal',
              },
            },
          },
        ],
      });
      databaseBuilder.factory.buildCombinedCourseParticipation({
        combinedCourseId: null,
        questId: ques1tId,
        organizationLearnerId: organizationLearner1.id,
      });

      databaseBuilder.factory.buildPassage({
        moduleId: moduleId2,
        userId: organizationLearner1.userId,
        createdAt: new Date('2024-01-01'),
        terminatedAt: null,
      });

      databaseBuilder.factory.buildPassage({
        moduleId: moduleId1,
        userId: organizationLearner1.userId,
        createdAt: new Date('2024-02-01'),
        terminatedAt: new Date('2024-01-02'),
      });

      // Second learner with combined course participations

      const {
        id: organizationLearner2Id,
        organizationId: organization2Id,
        userId: user2Id,
      } = databaseBuilder.factory.buildOrganizationLearner();
      organizationLearnerId2 = organizationLearner2Id;
      const { id: campaign2Id } = databaseBuilder.factory.buildCampaign({ organizationId: organization2Id });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign2Id,
        organizationLearnerId: organizationLearner2Id,
        userId: user2Id,
        status: 'SHARED',
      });

      const { questId: quest2Id } = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBINED_COURSE_2',
        organizationId: organization2Id,
        successRequirements: [
          {
            requirement_type: 'campaignParticipations',
            comparison: 'all',
            data: {
              campaignId: {
                data: campaign2Id,
                comparison: 'equal',
              },
              status: {
                data: 'SHARED',
                comparison: 'equal',
              },
            },
          },
          {
            requirement_type: 'passages',
            comparison: 'all',
            data: {
              moduleId: {
                data: moduleId1,
                comparison: 'equal',
              },
              isTerminated: {
                data: true,
                comparison: 'equal',
              },
            },
          },
          {
            requirement_type: 'passages',
            comparison: 'all',
            data: {
              moduleId: {
                data: moduleId2,
                comparison: 'equal',
              },
              isTerminated: {
                data: true,
                comparison: 'equal',
              },
            },
          },
        ],
      });
      databaseBuilder.factory.buildCombinedCourseParticipation({
        combinedCourseId: null,
        questId: quest2Id,
        organizationLearnerId: organizationLearner2Id,
      });

      databaseBuilder.factory.buildPassage({
        moduleId: moduleId3,
        userId: user2Id,
        createdAt: new Date('2024-02-01'),
        terminatedAt: new Date('2024-02-02'),
      });

      databaseBuilder.factory.buildPassage({
        moduleId: moduleId2,
        userId: user2Id,
        createdAt: new Date('2024-02-01'),
      });

      await databaseBuilder.commit();
    });

    it('should do nothing on dryrun mode to true', async function () {
      // when
      await script.handle({ options: { dryRun: true }, logger: loggerStub });

      // Then
      const resultLearner1 = await knex('organization_learner_participations')
        .where({ type: OrganizationLearnerParticipationTypes.PASSAGE, organizationLearnerId: organizationLearner1.id })
        .orderBy('createdAt', 'DESC');

      const resultLearner2 = await knex('organization_learner_participations')
        .where({ type: OrganizationLearnerParticipationTypes.PASSAGE, organizationLearnerId: organizationLearnerId2 })
        .orderBy('createdAt', 'DESC');

      expect(resultLearner1).lengthOf(0);
      expect(resultLearner2).lengthOf(0);
    });

    it('should create organization_learner_participations of type PASSAGES with Recommanded Combined Course moduleId only', async function () {
      // when
      await script.handle({ options: { dryRun: false }, logger: loggerStub });

      // Then
      const resultLearner1 = await knex('organization_learner_participations')
        .where({ type: OrganizationLearnerParticipationTypes.PASSAGE, organizationLearnerId: organizationLearner1.id })
        .orderBy('createdAt', 'DESC');

      const resultLearner2 = await knex('organization_learner_participations')
        .where({ type: OrganizationLearnerParticipationTypes.PASSAGE, organizationLearnerId: organizationLearnerId2 })
        .orderBy('createdAt', 'DESC');

      expect(resultLearner1).lengthOf(2);
      expect(resultLearner1[0].referenceId).equal(moduleId3);
      expect(resultLearner1[1].referenceId).equal(moduleId1);

      expect(resultLearner2).lengthOf(2);
      expect(resultLearner2[0].referenceId).equal(moduleId1);
      expect(resultLearner2[1].referenceId).equal(moduleId2);
    });

    it('should do not modify learner with already referenceId filled', async function () {
      // learner with participations with referenceId
      const { id: organizationLearnerId, organizationId, userId } = databaseBuilder.factory.buildOrganizationLearner();
      const { id: campaignId } = databaseBuilder.factory.buildCampaign({ organizationId });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId,
        organizationLearnerId,
        status: 'SHARED',
      });
      const { questId, id: combinedCourseId } = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBINED_COURSE_3',
        organizationId: organizationId,
        successRequirements: [
          {
            requirement_type: 'campaignParticipations',
            comparison: 'all',
            data: {
              campaignId: {
                data: campaignId,
                comparison: 'equal',
              },
              status: {
                data: 'SHARED',
                comparison: 'equal',
              },
            },
          },
          {
            requirement_type: 'passages',
            comparison: 'all',
            data: {
              moduleId: {
                data: moduleId1,
                comparison: 'equal',
              },
              isTerminated: {
                data: true,
                comparison: 'equal',
              },
            },
          },
          {
            requirement_type: 'passages',
            comparison: 'all',
            data: {
              moduleId: {
                data: moduleId3,
                comparison: 'equal',
              },
              isTerminated: {
                data: true,
                comparison: 'equal',
              },
            },
          },
        ],
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        combinedCourseId,
        questId,
        status: OrganizationLearnerParticipationStatuses.STARTED,
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        organizationLearnerId: organizationLearnerId,
      });

      databaseBuilder.factory.buildPassage({
        moduleId: moduleId2,
        userId,
        createdAt: new Date('2025-02-01'),
        terminatedAt: null,
      });

      databaseBuilder.factory.buildPassage({
        moduleId: moduleId1,
        userId,
        createdAt: new Date('2025-02-01'),
        terminatedAt: new Date('2025-01-02'),
      });

      const passageModuleId2 = databaseBuilder.factory.buildOrganizationLearnerParticipation({
        type: OrganizationLearnerParticipationTypes.PASSAGE,
        status: OrganizationLearnerParticipationStatuses.STARTED,
        moduleId: moduleId2,
        organizationLearnerId,
        createdAt: new Date('2024-02-01'),
      }).id;

      const passageModuleId1 = databaseBuilder.factory.buildOrganizationLearnerParticipation({
        type: OrganizationLearnerParticipationTypes.PASSAGE,
        status: OrganizationLearnerParticipationStatuses.COMPLETED,
        moduleId: moduleId1,
        organizationLearnerId,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        terminatedAt: new Date('2024-01-02'),
      }).id;

      await databaseBuilder.commit();

      await script.handle({ options: { dryRun: false }, logger: loggerStub });

      // Then
      const resultLearner = await knex('organization_learner_participations')
        .select('id')
        .where({ type: OrganizationLearnerParticipationTypes.PASSAGE, organizationLearnerId })
        .orderBy('createdAt', 'DESC')
        .pluck('id');
      const learnerPassageParticipations = await knex('organization_learner_passage_participations');

      expect(resultLearner).deep.members([passageModuleId1, passageModuleId2]);
      expect(learnerPassageParticipations).lengthOf(0);
    });

    it('should not insert duplicates when learner has two participations of type passage on the same organization', async function () {
      // other combinedCourse
      const { id: campaign1Id } = databaseBuilder.factory.buildCampaign({
        organizationId: organizationLearner1.organizationId,
      });
      databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign1Id,
        userId: organizationLearner1.userId,
        organizationLearnerId: organizationLearner1.id,
        status: 'SHARED',
      });
      const { questId: ques1tId } = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBINED_COURSE_4',
        organizationId: organizationLearner1.organizationId,
        successRequirements: [
          {
            requirement_type: 'campaignParticipations',
            comparison: 'all',
            data: {
              campaignId: {
                data: campaign1Id,
                comparison: 'equal',
              },
              status: {
                data: 'SHARED',
                comparison: 'equal',
              },
            },
          },
          {
            requirement_type: 'passages',
            comparison: 'all',
            data: {
              moduleId: {
                data: moduleId1,
                comparison: 'equal',
              },
              isTerminated: {
                data: true,
                comparison: 'equal',
              },
            },
          },
          {
            requirement_type: 'passages',
            comparison: 'all',
            data: {
              moduleId: {
                data: moduleId3,
                comparison: 'equal',
              },
              isTerminated: {
                data: true,
                comparison: 'equal',
              },
            },
          },
        ],
      });
      databaseBuilder.factory.buildCombinedCourseParticipation({
        combinedCourseId: null,
        questId: ques1tId,
        organizationLearnerId: organizationLearner1.id,
      });
      await databaseBuilder.commit();

      await script.handle({ options: { dryRun: false }, logger: loggerStub });

      // Then
      const resultLearner = await knex('organization_learner_participations')
        .select('id')
        .where({ type: OrganizationLearnerParticipationTypes.PASSAGE, organizationLearnerId: organizationLearner1.id })
        .orderBy('createdAt', 'DESC');

      expect(resultLearner).lengthOf(2);
    });
  });
});
