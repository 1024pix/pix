import * as checkCampaignBelongsToCombinedCourse from '../../../../../../src/prescription/campaign/application/usecases/checkCampaignBelongsToCombinedCourse.js';
import { CampaignBelongsToCombinedCourseError } from '../../../../../../src/prescription/campaign/domain/errors.js';
import { CombinedCourseBlueprint } from '../../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Campaign | Application | Usecases | checkCampaignBelongsToCombinedCourse', function () {
  let organizationId, campaignId;

  beforeEach(async function () {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;

    await databaseBuilder.commit();
  });

  it('should throw if a campaign belongs to combined course', async function () {
    // given
    const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId }).toDTO()],
    });
    databaseBuilder.factory.buildCombinedCourse({
      code: 'ABCDE1234',
      name: 'Mon parcours Combiné',
      organizationId,
      questId,
    });
    await databaseBuilder.commit();

    // when
    const error = await catchErr(checkCampaignBelongsToCombinedCourse.execute)({ campaignId });

    // then
    expect(error).instanceOf(CampaignBelongsToCombinedCourseError);
  });

  it('should not throw if campaign does not belongs to combined course', async function () {
    const anotherCampaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;

    const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: anotherCampaignId }).toDTO(),
      ],
    });
    databaseBuilder.factory.buildCombinedCourse({
      code: 'ABCDE1234',
      name: 'Mon parcours Combiné',
      organizationId,
      questId,
    });
    await databaseBuilder.commit();

    await expect(checkCampaignBelongsToCombinedCourse.execute({ campaignId })).fulfilled;
  });
});
