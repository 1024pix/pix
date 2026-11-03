import { expect } from 'chai';

import { usecases } from '../../../../../src/lti/domain/usecases/index.js';
import { CombinedCourseBlueprint } from '../../../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | LTI | Domain | Usecases | getLtiCampaignsByOrganizations', function () {
  it('should return LTI campaigns', async function () {
    // given
    const firstOrganizationId = databaseBuilder.factory.buildOrganization().id;
    const secondOrganizationId = databaseBuilder.factory.buildOrganization().id;
    databaseBuilder.factory.buildCampaign({ organizationId: firstOrganizationId });
    databaseBuilder.factory.buildCampaign({ organizationId: firstOrganizationId });
    databaseBuilder.factory.buildCampaign({ organizationId: secondOrganizationId });
    databaseBuilder.factory.buildCampaign();
    await databaseBuilder.commit();

    // when
    const campaigns = await usecases.getLtiCampaignsByOrganizations({
      organizationIds: [firstOrganizationId, secondOrganizationId],
    });

    // then
    expect(campaigns.length).to.equal(3);
  });

  it('should exclude campaigns from combined courses', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const { id: campaignInCombinedCourseId } = databaseBuilder.factory.buildCampaign({ organizationId });
    const { id: assessmentCampaignId } = databaseBuilder.factory.buildCampaign({ organizationId });

    const { id: questId } = databaseBuilder.factory.buildQuestForCombinedCourse({
      successRequirements: [
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({ campaignId: campaignInCombinedCourseId }).toDTO(),
      ],
    });
    databaseBuilder.factory.buildCombinedCourse({ code: 'RANDOM', questId, organizationId });
    await databaseBuilder.commit();

    // when
    const campaigns = await usecases.getLtiCampaignsByOrganizations({ organizationIds: [organizationId] });

    // then
    expect(campaigns.length).to.equal(1);
    expect(campaigns[0].id).to.equal(assessmentCampaignId);
  });
});
