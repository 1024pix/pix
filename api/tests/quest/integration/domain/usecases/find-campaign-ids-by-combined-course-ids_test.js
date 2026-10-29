import { expect } from 'chai';

import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Quest | Domain | UseCases | find-campaign-ids-by-combined-course-ids', function () {
  it('should return an array of campaign ids if at least a result is found', async function () {
    //given
    const { id: campaignId } = databaseBuilder.factory.buildCampaign();

    const { id: questId1 } = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId }).toDTO()],
    });

    const { id: combinedCourseId1 } = databaseBuilder.factory.buildCombinedCourse({
      code: 'RANDOM',
      questId: questId1,
    });

    await databaseBuilder.commit();

    //when
    const results = await usecases.findCampaignIdsByCombinedCourseIds({ combinedCourseIds: [combinedCourseId1] });

    //then
    expect(results).lengthOf(1);
    expect(results).to.deep.equal([campaignId]);
  });

  it('should return an empty array of if no campaign is found', async function () {
    //given
    const { id: combinedCourseId1 } = databaseBuilder.factory.buildCombinedCourse({
      code: 'RANDOM',
      questId: databaseBuilder.factory.buildQuestForCombinedCourse().id,
    });

    await databaseBuilder.commit();

    //when
    const results = await usecases.findCampaignIdsByCombinedCourseIds({ combinedCourseIds: [combinedCourseId1] });

    //then
    expect(results).lengthOf(0);
    expect(results).to.deep.equal([]);
  });
});
