import { expect } from 'chai';

import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import * as campaignRepository from '../../../../../src/quest/infrastructure/repositories/combined-courses/campaign-repository.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Quest | Integration | Repository | campaign', function () {
  describe('#getCampaignsByCombinedCourseIds', function () {
    it('should return correct campaign ids', async function () {
      const { id: campaignId, organizationId } = databaseBuilder.factory.buildCampaign();
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
      const campaigns = await campaignRepository.getCampaignsByCombinedCourseIds({
        combinedCourseIds: [combinedCourseId1, combinedCourseId2],
      });

      // then
      expect(campaigns).to.have.lengthOf(1);
      expect(campaigns[0]).to.deep.equal({ id: campaignId, organizationId });
    });
  });
});
