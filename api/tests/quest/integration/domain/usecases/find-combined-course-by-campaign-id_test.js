import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { CombinedCourse } from '../../../../../src/quest/domain/models/combined-courses/entities/CombinedCourse.js';
import { usecases } from '../../../../../src/quest/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Quest | Domain | UseCases | get-combined-course-by-campaign-id', function () {
  let courseId, organizationId, campaignId;

  beforeEach(async function () {
    //given
    organizationId = databaseBuilder.factory.buildOrganization().id;
    campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
    const code = 'ABCDE1234';
    const name = 'Mon parcours Combiné';
    const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId }).toDTO()],
    });
    courseId = databaseBuilder.factory.buildCombinedCourse({
      code,
      name,
      organizationId,
      questId,
    }).id;
    await databaseBuilder.commit();
  });

  it('should return a combined course', async function () {
    // when
    const result = await usecases.findCombinedCourseByCampaignId({ campaignId });

    // then
    expect(result).lengthOf(1);
    expect(result[0]).instanceOf(CombinedCourse);
    expect(result[0].id).equal(courseId);
  });

  it('should return an empty array if no quest match', async function () {
    //given
    const campaigNotInQuest = databaseBuilder.factory.buildCampaign({ organizationId });

    await databaseBuilder.commit();

    // when
    const result = await usecases.findCombinedCourseByCampaignId({ campaignId: campaigNotInQuest.id });

    // then
    expect(result).deep.equal([]);
  });
});
