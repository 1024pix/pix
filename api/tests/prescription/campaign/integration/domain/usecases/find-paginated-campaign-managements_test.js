import { CampaignManagement } from '../../../../../../src/prescription/campaign/domain/models/CampaignManagement.js';
import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';
import { CombinedCourseBlueprint } from '../../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | find-paginated-campaign-managements', function () {
  it('should return an instance of Campaign Management with a correct isPartOfCombinedCourse attribute', async function () {
    //given
    const page = { size: 10, number: 1 };
    const organizationId = await databaseBuilder.factory.buildOrganization().id;
    await databaseBuilder.factory.buildCampaign({ organizationId }).id;
    const campaignIdInCombinedCourse = await databaseBuilder.factory.buildCampaign({ organizationId }).id;

    const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: campaignIdInCombinedCourse }).toDTO(),
      ],
    });
    databaseBuilder.factory.buildCombinedCourse({
      code: 'ABCDE1234',
      name: 'Mon parcours Combiné',
      organizationId,
      questId,
    });
    await databaseBuilder.commit();

    // when
    const result = await usecases.findPaginatedCampaignManagements({
      organizationId,
      page,
    });

    //then
    expect(result.models[0]).to.be.instanceOf(CampaignManagement);
    expect(result.models[1]).to.be.instanceOf(CampaignManagement);
    expect(result.models[0].isPartOfCombinedCourse).to.be.false;
    expect(result.models[1].isPartOfCombinedCourse).to.be.true;
  });
});
