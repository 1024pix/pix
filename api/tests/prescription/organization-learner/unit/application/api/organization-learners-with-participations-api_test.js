import * as organizationLearnersWithParticipationsApi from '../../../../../../src/prescription/organization-learner/application/api/organization-learners-with-participations-api.js';
import { OrganizationLearnerWithParticipations } from '../../../../../../src/prescription/organization-learner/application/api/read-models/OrganizationLearnerWithParticipations.js';
import { usecases } from '../../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Unit | API | Organization Learner With Participations', function () {
  describe('#find', function () {
    it('should call the usecase and return OrganizationLearnerWithParticipations list', async function () {
      // given
      const userIds = [1, 2];

      const organization1 = domainBuilder.buildOrganization();
      const organizationLearner1 = domainBuilder.buildOrganizationLearner();
      const organization2 = domainBuilder.buildOrganization();
      const organizationLearner2 = domainBuilder.buildOrganizationLearner();
      const campaignParticipations = [
        domainBuilder.buildCampaignParticipationOverview(),
        domainBuilder.buildCampaignParticipationOverview(),
      ];
      const tagNames = ['tagName1', 'tagName1'];

      const useCaseStub = sinon.stub(usecases, 'findOrganizationLearnersWithParticipations');
      useCaseStub.withArgs({ userIds }).resolves([
        { organizationLearner: organizationLearner1, organization: organization1, campaignParticipations, tagNames },
        { organizationLearner: organizationLearner2, organization: organization2, campaignParticipations, tagNames },
      ]);

      // when
      const apiResponse = await organizationLearnersWithParticipationsApi.find({ userIds });

      // then
      expect(useCaseStub.calledOnce).to.be.true;

      expect(apiResponse).to.have.lengthOf(2);
      expect(apiResponse[0]).to.be.instanceOf(OrganizationLearnerWithParticipations);
      expect(apiResponse[1]).to.be.instanceOf(OrganizationLearnerWithParticipations);
      expect(apiResponse).to.deep.have.members([
        {
          organizationLearner: {
            id: organizationLearner1.id,
            MEFCode: organizationLearner1.MEFCode,
          },
          organization: {
            id: organization1.id,
            isManagingStudents: organization1.isManagingStudents,
            tags: tagNames,
            type: organization1.type,
          },
          campaignParticipations: campaignParticipations.map(({ id, targetProfileId, status }) => ({
            id,
            targetProfileId,
            status,
          })),
        },
        {
          organizationLearner: {
            id: organizationLearner2.id,
            MEFCode: organizationLearner2.MEFCode,
          },
          organization: {
            id: organization2.id,
            isManagingStudents: organization2.isManagingStudents,
            tags: tagNames,
            type: organization2.type,
          },
          campaignParticipations: campaignParticipations.map(({ id, targetProfileId, status }) => ({
            id,
            targetProfileId,
            status,
          })),
        },
      ]);
    });
  });
});
