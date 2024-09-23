import * as campaignParticipationOverviewRepository from '../../../../../../lib/infrastructure/repositories/campaign-participation-overview-repository.js';
import * as libOrganizationLearnerRepository from '../../../../../../lib/infrastructure/repositories/organization-learner-repository.js';
import { Organization } from '../../../../../../src/organizational-entities/domain/models/Organization.js';
import { tagRepository } from '../../../../../../src/organizational-entities/infrastructure/repositories/tag.repository.js';
import { findOrganizationLearnersWithParticipations } from '../../../../../../src/prescription/organization-learner/domain/usecases/find-organization-learners-with-participations.js';
import { OrganizationLearner } from '../../../../../../src/shared/domain/models/OrganizationLearner.js';
import { CampaignParticipationOverview } from '../../../../../../src/shared/domain/read-models/CampaignParticipationOverview.js';
import * as organizationRepository from '../../../../../../src/shared/infrastructure/repositories/organization-repository.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | UseCases | find-organization-learners-with-participations', function () {
  it('should return a distinct organization learners list', async function () {
    // given
    const user1 = databaseBuilder.factory.buildUser();
    const organization1 = databaseBuilder.factory.buildOrganization();
    const organization2 = databaseBuilder.factory.buildOrganization();

    const organizationLearner1 = databaseBuilder.factory.buildOrganizationLearner({
      userId: user1.id,
      organizationId: organization1.id,
      division: '5eme',
    });
    const organizationLearner1bis = databaseBuilder.factory.buildOrganizationLearner({
      userId: user1.id,
      organizationId: organization2.id,
      division: '5eme',
    });

    const user2 = databaseBuilder.factory.buildUser();
    const organizationLearner2 = databaseBuilder.factory.buildOrganizationLearner({
      userId: user2.id,
      organizationId: organization2.id,
      division: '5eme',
    });

    await databaseBuilder.commit();

    // when
    const organizationLearnersWithParticipations = await findOrganizationLearnersWithParticipations({
      userIds: [user1.id, user2.id],
      campaignParticipationOverviewRepository,
      organizationRepository,
      libOrganizationLearnerRepository,
      tagRepository,
    });

    // then
    expect(organizationLearnersWithParticipations).to.have.lengthOf(3);

    const organizationLearnersIds = organizationLearnersWithParticipations.map(
      (organizationLearnersWithParticipations) => organizationLearnersWithParticipations.organizationLearner.id,
    );
    expect(organizationLearnersIds).to.have.members([
      organizationLearner1.id,
      organizationLearner1bis.id,
      organizationLearner2.id,
    ]);
  });

  it('should return organization learners list and their campaign participations', async function () {
    // given
    const organization = databaseBuilder.factory.buildOrganization();
    const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({
      userId: databaseBuilder.factory.buildUser().id,
      organizationId: organization.id,
      division: '5eme',
    });
    const tag = databaseBuilder.factory.buildTag();
    databaseBuilder.factory.buildOrganizationTag({ organizationId: organization.id, tagId: tag.id });

    const campaignParticipation1 = databaseBuilder.factory.buildCampaignParticipation({
      campaignId: databaseBuilder.factory.buildCampaign({ organizationId: organization.id }).id,
      organizationLearnerId: organizationLearner.id,
      userId: organizationLearner.userId,
    });

    const campaignParticipation2 = databaseBuilder.factory.buildCampaignParticipation({
      campaignId: databaseBuilder.factory.buildCampaign({ organizationId: organization.id }).id,
      organizationLearnerId: organizationLearner.id,
      userId: organizationLearner.userId,
    });

    await databaseBuilder.commit();

    // when
    const organizationLearnersWithParticipations = await findOrganizationLearnersWithParticipations({
      userIds: [organizationLearner.userId],
      campaignParticipationOverviewRepository,
      organizationRepository,
      libOrganizationLearnerRepository,
      tagRepository,
    });

    // then
    expect(organizationLearnersWithParticipations).to.have.lengthOf(1);

    expect(organizationLearnersWithParticipations[0].organizationLearner).to.be.an.instanceOf(OrganizationLearner);
    expect(organizationLearnersWithParticipations[0].organizationLearner.id).to.equal(organizationLearner.id);

    expect(organizationLearnersWithParticipations[0].organization).to.be.an.instanceOf(Organization);
    expect(organizationLearnersWithParticipations[0].organization.id).to.equal(organization.id);

    expect(organizationLearnersWithParticipations[0].campaignParticipations).to.have.lengthOf(2);
    expect(organizationLearnersWithParticipations[0].campaignParticipations[0]).to.be.an.instanceOf(
      CampaignParticipationOverview,
    );
    expect(organizationLearnersWithParticipations[0].campaignParticipations[1]).to.be.an.instanceOf(
      CampaignParticipationOverview,
    );
    const participationOverviewIds = organizationLearnersWithParticipations[0].campaignParticipations.map(
      (participation) => participation.id,
    );
    expect(participationOverviewIds).to.have.members([campaignParticipation1.id, campaignParticipation2.id]);
  });
});
