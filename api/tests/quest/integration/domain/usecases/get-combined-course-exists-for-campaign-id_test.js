import { expect } from 'chai';

import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Quest | Domain | UseCases | get-combined-course-exists-for-campaign-id', function () {
  let campaignId;

  beforeEach(async function () {
    //given
    campaignId = databaseBuilder.factory.buildCampaign().id;

    await databaseBuilder.commit();
  });

  it('should return true when a combined course is found', async function () {
    //given
    const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId }).toDTO()],
    });
    databaseBuilder.factory.buildCombinedCourse({
      questId,
    }).id;

    await databaseBuilder.commit();

    // when
    const result = await usecases.getCombinedCourseExistsForCampaignId({ campaignId });

    // then
    expect(result).to.be.true;
  });

  it('should return false if no combined course matches', async function () {
    //given
    const otherCampaign = databaseBuilder.factory.buildCampaign();
    const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: otherCampaign.id }).toDTO(),
      ],
    });
    databaseBuilder.factory.buildCombinedCourse({
      questId,
    }).id;

    await databaseBuilder.commit();

    // when
    const result = await usecases.getCombinedCourseExistsForCampaignId({ campaignId });

    // then
    expect(result).to.be.false;
  });
});
