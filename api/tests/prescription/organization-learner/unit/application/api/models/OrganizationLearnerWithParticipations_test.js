import { OrganizationLearnerWithParticipations } from '../../../../../../../src/prescription/organization-learner/application/api/read-models/OrganizationLearnerWithParticipations.js';
import { CampaignParticipationStatuses } from '../../../../../../../src/prescription/shared/domain/constants.js';

import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Application| API | Models | OrganizationLearnerWithParticipations', function () {
  it('should return attributes from user', function () {
    // given
    const tagNames = ['tag1', 'tag2'];
    const organization = domainBuilder.buildOrganization();
    const organizationLearner = domainBuilder.buildOrganizationLearner();
    const participationsList = [
      domainBuilder.buildCampaignParticipationOverview({
        id: 123,
        targetProfileId: 321,
        status: CampaignParticipationStatuses.SHARED,
        campaignName: 'Mon nom 1',
        campaignId: 66,
        masteryRate: 75,
        totalStagesCount: 3,
        validatedStagesCount: 3,
      }),
      domainBuilder.buildCampaignParticipationOverview({
        id: 456,
        targetProfileId: 654,
        status: CampaignParticipationStatuses.STARTED,
        campaignName: 'Mon nom 2',
        campaignId: 77,
        masteryRate: 80,
        totalStagesCount: 1,
        validatedStagesCount: 5,
      }),
    ];

    // when
    const organizationLearnerWithParticipations = new OrganizationLearnerWithParticipations({
      organizationLearner,
      organization,
      campaignParticipations: participationsList,
      tagNames,
    });

    // then
    expect(organizationLearnerWithParticipations).to.have.keys(
      'organizationLearner',
      'organization',
      'campaignParticipations',
    );
    expect(organizationLearnerWithParticipations.organizationLearner).to.deep.equal({
      id: organizationLearner.id,
    });
    expect(organizationLearnerWithParticipations.organization).to.deep.equal({
      id: organization.id,
      isManagingStudents: organization.isManagingStudents,
      tags: tagNames,
      type: organization.type,
    });
    expect(organizationLearnerWithParticipations.campaignParticipations).to.deep.have.members([
      {
        targetProfileId: 321,
        id: 123,
        status: CampaignParticipationStatuses.SHARED,
        campaignName: 'Mon nom 1',
        campaignId: 66,
        masteryRate: 75,
        totalStagesCount: 3,
        validatedStagesCount: 3,
      },
      {
        targetProfileId: 654,
        id: 456,
        status: CampaignParticipationStatuses.STARTED,
        campaignName: 'Mon nom 2',
        campaignId: 77,
        masteryRate: 80,
        totalStagesCount: 1,
        validatedStagesCount: 5,
      },
    ]);
  });
});
