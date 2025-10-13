import { CreateOrUpdateOrganizationLearnerParticipationsForCombinedCourses } from '../../../../src/prescription/scripts/create-or-update-organization-learner-participations-for-combined-courses.js';
import {
  OrganizationLearnerParticipationStatuses,
  OrganizationLearnerParticipationTypes,
} from '../../../../src/quest/domain/models/OrganizationLearnerParticipation.js';
import { databaseBuilder, expect, knex, sinon } from '../../../test-helper.js';

describe('Integration | Prescription | Script | Prod | Create or insert organization-learner-participations', function () {
  let script, loggerStub;

  beforeEach(async function () {
    script = new CreateOrUpdateOrganizationLearnerParticipationsForCombinedCourses();
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

  describe('when combined_course_participation is linked to organization_learner_participation', function () {
    it('should update referenceId column on related row', async function () {
      //given
      const { id: combinedCourse1Id, questId: quest1Id } = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBI3',
      });
      const { id: combinedCourse2Id, questId: quest2Id } = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBI4',
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        status: OrganizationLearnerParticipationStatuses.STARTED,
        combinedCourseId: combinedCourse1Id,
        questId: quest1Id,
        createdAt: new Date('2025-01-01'),
        attributes: JSON.stringify({ id: combinedCourse1Id }),
        addAttributes: false,
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        status: OrganizationLearnerParticipationStatuses.STARTED,
        combinedCourseId: combinedCourse2Id,
        questId: quest2Id,
        createdAt: new Date('2025-02-02'),
        addAttributes: false,
      });
      await databaseBuilder.commit();

      //when
      await script.handle({ options: { dryRun: false }, logger: loggerStub });

      const result = await knex('organization_learner_participations').orderBy('createdAt', 'DESC');

      expect(result).lengthOf(2);
      expect(result[0].attributes).null;
      expect(result[1].attributes).null;
      expect(result[0].referenceId).equal(combinedCourse2Id.toString());
      expect(result[1].referenceId).deep.equal(combinedCourse1Id.toString());
    });

    it('should do nothing on dryrun true', async function () {
      //given
      const { id: combinedCourse1Id, questId: quest1Id } = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBI3',
      });
      const { id: combinedCourse2Id, questId: quest2Id } = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBI4',
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        status: OrganizationLearnerParticipationStatuses.STARTED,
        combinedCourseId: combinedCourse1Id,
        questId: quest1Id,
        createdAt: new Date('2025-01-01'),
        attributes: JSON.stringify({ id: combinedCourse1Id }),
        addAttributes: false,
      });
      databaseBuilder.factory.buildOrganizationLearnerParticipation({
        type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
        status: OrganizationLearnerParticipationStatuses.STARTED,
        combinedCourseId: combinedCourse2Id,
        questId: quest2Id,
        createdAt: new Date('2025-02-02'),
        addAttributes: false,
      });
      await databaseBuilder.commit();

      //when
      await script.handle({ options: { dryRun: true }, logger: loggerStub });

      const result = await knex('organization_learner_participations').orderBy('createdAt', 'DESC');

      expect(result).lengthOf(2);
      expect(result[0].attributes).null;
      expect(result[1].attributes).deep.equal({ id: combinedCourse1Id });
      expect(result[0].referenceId).null;
      expect(result[1].referenceId).null;
    });
  });

  describe('when the combined course participation is not linked to organization learner participation', function () {
    it('should insert row', async function () {
      //given
      const { id: combinedCourse1Id, questId: quest1Id } = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBI4',
      });
      const { id: combinedCourseParticipationId1 } = databaseBuilder.factory.buildCombinedCourseParticipation({
        questId: quest1Id,
        combinedCourseId: null,
        createdAt: new Date('2025-01-01'),
        addAttributes: false,
      });

      const { id: combinedCourse2Id, questId: quest2Id } = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBI5',
      });
      const { id: combinedCourseParticipationId2 } = databaseBuilder.factory.buildCombinedCourseParticipation({
        questId: quest2Id,
        combinedCourseId: null,
        createdAt: new Date('2025-02-01'),
        addAttributes: false,
      });

      await databaseBuilder.commit();

      //when
      await script.handle({ options: { dryRun: false }, logger: loggerStub });

      const result = await knex('organization_learner_participations').orderBy('createdAt', 'DESC');

      const combinedCourseParticipations = await knex('combined_course_participations')
        .whereIn('id', [combinedCourseParticipationId1, combinedCourseParticipationId2])
        .orderBy('createdAt', 'DESC');

      expect(result).lengthOf(2);
      expect(result[0].referenceId).equal(combinedCourse2Id.toString());
      expect(result[1].referenceId).equal(combinedCourse1Id.toString());
      expect(combinedCourseParticipations[0].organizationLearnerParticipationId).equal(result[0].id);
      expect(combinedCourseParticipations[1].organizationLearnerParticipationId).equal(result[1].id);
    });

    it('should do nothing on dryRun true', async function () {
      //given
      const { questId: quest1Id } = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBI4',
      });
      databaseBuilder.factory.buildCombinedCourseParticipation({
        questId: quest1Id,
        combinedCourseId: null,
        createdAt: new Date('2025-01-01'),
        addAttributes: false,
      });

      const { questId: quest2Id } = databaseBuilder.factory.buildCombinedCourse({
        code: 'COMBI5',
      });
      databaseBuilder.factory.buildCombinedCourseParticipation({
        questId: quest2Id,
        combinedCourseId: null,
        createdAt: new Date('2025-02-01'),
        addAttributes: false,
      });

      await databaseBuilder.commit();

      //when
      await script.handle({ options: { dryRun: true }, logger: loggerStub });

      const result = await knex('organization_learner_participations').orderBy('createdAt', 'DESC');

      expect(result).lengthOf(0);
    });
  });
});
