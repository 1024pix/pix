import { OrganizationLearnerWithParticipations } from '../../../../../../../src/prescription/organization-learner/application/api/read-models/OrganizationLearnerWithParticipations.js';
import { domainBuilder, expect } from '../../../../../../test-helper.js';

describe('Unit | Application| API | Models | OrganizationLearnerWithParticipations', function () {
  it('should return attributes from user', function () {
    // given
    const tagNames = ['tag1', 'tag2'];
    const organization = domainBuilder.buildOrganization();
    const organizationLearner = domainBuilder.buildOrganizationLearner();
    const participationsList = [
      domainBuilder.buildCampaignParticipationOverview(),
      domainBuilder.buildCampaignParticipationOverview(),
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
      MEFCode: organizationLearner.MEFCode,
    });
    expect(organizationLearnerWithParticipations.organization).to.deep.equal({
      id: organization.id,
      isManagingStudents: organization.isManagingStudents,
      tags: tagNames,
      type: organization.type,
    });
    expect(organizationLearnerWithParticipations.campaignParticipations).to.deep.have.members([
      {
        targetProfileId: participationsList[0].targetProfileId,
        id: participationsList[0].id,
        status: participationsList[0].status,
      },
      {
        targetProfileId: participationsList[1].targetProfileId,
        id: participationsList[1].id,
        status: participationsList[1].status,
      },
    ]);
  });
});
