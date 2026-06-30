import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import * as campaignRepository from '../../../../../src/quest/infrastructure/repositories/campaign-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Quest | Integration | Repository | campaign', function () {
  describe('#getCampaignIdsByCombinedCourseIds', function () {
    it('should return correct campaign ids', async function () {
      const { id: campaignId } = databaseBuilder.factory.buildCampaign();
      const { id: otherCampaignId } = databaseBuilder.factory.buildCampaign();

      const { id: questId1 } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId }).toDTO()],
      });
      const { id: combinedCourseId1 } = databaseBuilder.factory.buildCombinedCourse({
        code: 'RANDOM',
        questId: questId1,
      });
      const { id: combinedCourseId2 } = databaseBuilder.factory.buildCombinedCourse({ code: 'LKJHG' });
      const { id: questId3 } = databaseBuilder.factory.buildQuestForCombinedCourse({
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: otherCampaignId }).toDTO(),
        ],
      });
      databaseBuilder.factory.buildCombinedCourse({
        questId: questId3,
      });

      await databaseBuilder.commit();

      //when
      const campaignIds = await campaignRepository.getCampaignIdsByCombinedCourseIds({
        combinedCourseIds: [combinedCourseId1, combinedCourseId2],
      });

      // then
      expect(campaignIds).to.have.lengthOf(1);
      expect(campaignIds[0]).to.deep.equal(campaignId);
    });
  });
});
