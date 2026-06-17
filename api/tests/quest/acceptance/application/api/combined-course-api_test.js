import * as combinedCourseApi from '../../../../../src/quest/application/api/combined-course-api.js';
import { CombinedCourse } from '../../../../../src/quest/application/api/CombinedCourse.model.js';
import { MultipleQuestFoundError } from '../../../../../src/quest/application/api/errors.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Acceptance | Quest | Application | combined-course-api', function () {
  let organizationId, campaignId, combinedCourseId, combinedCourseName;
  beforeEach(async function () {
    //given
    organizationId = databaseBuilder.factory.buildOrganization().id;
    campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
    combinedCourseName = 'Mon parcours Combiné';
    const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId }).toDTO()],
    });
    combinedCourseId = databaseBuilder.factory.buildCombinedCourse({
      code: 'ABCDE1234',
      name: combinedCourseName,
      organizationId,
      questId,
    }).id;
    await databaseBuilder.commit();
  });

  it('should return combined courses by campaignId', async function () {
    // when
    const result = await combinedCourseApi.getByCampaignId(campaignId);

    // then
    expect(result).to.be.instanceOf(CombinedCourse);
    expect(result.id).to.equal(combinedCourseId);
    expect(result.name).to.equal(combinedCourseName);
  });

  it('should return null if no combined courses found', async function () {
    //given
    const campaignNotInQuest = databaseBuilder.factory.buildCampaign({ organizationId });
    await databaseBuilder.commit();

    // when
    const result = await combinedCourseApi.getByCampaignId(campaignNotInQuest.id);

    // then
    expect(result).null;
  });

  it('should throw an error if multiple combined courses found', async function () {
    //given
    const { id: questId2 } = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId }).toDTO()],
    });
    databaseBuilder.factory.buildCombinedCourse({
      code: 'QWERTY123',
      name: combinedCourseName,
      organizationId,
      questId: questId2,
    });

    await databaseBuilder.commit();

    // when
    const error = await catchErr(combinedCourseApi.getByCampaignId)(campaignId);

    // then
    expect(error).instanceOf(MultipleQuestFoundError);
  });
});
