import { CombinedCourseDetails } from '../../../../../src/quest/domain/models/combined-course-participation/CombinedCourseDetails.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/CombinedCourseBlueprint.js';
import * as combinedCourseDetailsRepository from '../../../../../src/quest/infrastructure/repositories/combined-course-details-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Quest | Integration | Repository | combined-course-details', function () {
  describe('#findByOrganizationId', function () {
    it('should return all combined course details for a given organization', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      const moduleId = 'eeeb4951-6f38-4467-a4ba-0c85ed71321a';
      const { id: questId1 } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId }).toDTO()],
      });
      const combinedCourse1 = databaseBuilder.factory.buildCombinedCourse({
        code: 'COURSE1',
        name: 'Parcours 1',
        organizationId,
        questId: questId1,
      });
      const { id: questId2 } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId }).toDTO()],
      });
      const combinedCourse2 = databaseBuilder.factory.buildCombinedCourse({
        code: 'COURSE2',
        name: 'Parcours 2',
        organizationId,
        questId: questId2,
      });
      await databaseBuilder.commit();

      // when
      const combinedCourses = await combinedCourseDetailsRepository.findByOrganizationId({ organizationId });

      // then
      expect(combinedCourses).lengthOf(2);
      expect(combinedCourses[0]).instanceof(CombinedCourseDetails);
      expect(combinedCourses[1]).instanceof(CombinedCourseDetails);
      expect(combinedCourses[0]).deep.equal(new CombinedCourseDetails(combinedCourse1));
      expect(combinedCourses[1]).deep.equal(new CombinedCourseDetails(combinedCourse2));
      expect(combinedCourses[0].campaignIds).deep.equal([campaignId]);
      expect(combinedCourses[1].moduleIds).deep.equal([moduleId]);
    });

    it('should return an empty array when no combined courses exist for the organization', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const anotherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: 123 }).toDTO()],
      });
      databaseBuilder.factory.buildCombinedCourse({
        code: 'COURSE1',
        name: 'Parcours 1',
        organizationId: anotherOrganizationId,
        questId,
      });
      await databaseBuilder.commit();

      // when
      const combinedCourses = await combinedCourseDetailsRepository.findByOrganizationId({ organizationId });

      // then
      expect(combinedCourses).lengthOf(0);
    });
  });
});
