import { Organization } from '../../../../../../src/organizational-entities/domain/models/Organization.js';
import { usecases } from '../../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { CampaignParticipationOverview } from '../../../../../../src/prescription/shared/domain/read-models/CampaignParticipationOverview.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | UseCases | get-organization-learner-with-participations', function () {
  it('should return organization learner with participations', async function () {
    // given
    const organization = databaseBuilder.factory.buildOrganization();
    const { id: organizationLearnerId, userId } = databaseBuilder.factory.buildOrganizationLearner({
      organizationId: organization.id,
    });
    const tags = [
      databaseBuilder.factory.buildTag({ name: 'AEFE' }),
      databaseBuilder.factory.buildTag({ name: 'AGRI' }),
    ];
    for (const tag of tags) {
      databaseBuilder.factory.buildOrganizationTag({ organizationId: organization.id, tagId: tag.id });
    }
    const firstTargetProfileId = databaseBuilder.factory.buildTargetProfile({
      ownerOrganizationId: organization.id,
    }).id;
    const firstCampaign = databaseBuilder.factory.buildCampaign({ targetProfileId: firstTargetProfileId });
    const firstCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
      campaignId: firstCampaign.id,
      userId,
      organizationLearnerId,
    });

    const secondTargetProfileId = databaseBuilder.factory.buildTargetProfile({
      ownerOrganizationId: organization.id,
    }).id;
    const secondCampaign = databaseBuilder.factory.buildCampaign({ targetProfileId: secondTargetProfileId });
    const secondCampaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
      campaignId: secondCampaign.id,
      userId,
      organizationLearnerId,
    });
    await databaseBuilder.commit();

    // when
    const result = await usecases.getOrganizationLearnerWithParticipations({ userId, organizationId: organization.id });

    // then
    expect(result.organizationLearner.id).to.equal(organizationLearnerId);

    expect(result.organization).to.be.an.instanceOf(Organization);
    expect(result.organization.id).to.equal(organization.id);

    expect(result.campaignParticipations).to.have.lengthOf(2);
    expect(result.campaignParticipations[0]).to.be.an.instanceOf(CampaignParticipationOverview);
    expect(result.campaignParticipations[1]).to.be.an.instanceOf(CampaignParticipationOverview);
    const participationOverviewIds = result.campaignParticipations.map((participation) => participation.id);
    expect(participationOverviewIds).to.have.members([firstCampaignParticipation.id, secondCampaignParticipation.id]);
  });
});
