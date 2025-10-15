import * as organizationLearnersWithParticipationsApi from '../../../../../../src/prescription/organization-learner/application/api/organization-learners-with-participations-api.js';
import { OrganizationLearnerWithParticipations } from '../../../../../../src/prescription/organization-learner/application/api/read-models/OrganizationLearnerWithParticipations.js';
import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | API | Organization Learner With Participations', function () {
  describe('#find', function () {
    it('return OrganizationLearnerWithParticipations list given userIds', async function () {
      // given
      const organization1 = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
      const organization2 = databaseBuilder.factory.buildOrganization();

      const tag1 = databaseBuilder.factory.buildTag({ name: 'tag1' });
      const tag2 = databaseBuilder.factory.buildTag({ name: 'tag2' });

      databaseBuilder.factory.buildOrganizationTag({ organizationId: organization1.id, tagId: tag1.id });
      databaseBuilder.factory.buildOrganizationTag({ organizationId: organization1.id, tagId: tag2.id });

      const user1 = databaseBuilder.factory.buildUser();
      const user2 = databaseBuilder.factory.buildUser();
      const user3 = databaseBuilder.factory.buildUser();

      const userIds = [user1.id, user2.id];

      const organizationLearner1 = databaseBuilder.factory.buildOrganizationLearner({
        userId: user1.id,
        organizationId: organization1.id,
      });

      const organizationLearner2 = databaseBuilder.factory.buildOrganizationLearner({
        userId: user1.id,
        organizationId: organization2.id,
      });

      const organizationLearner3 = databaseBuilder.factory.buildOrganizationLearner({
        userId: user2.id,
        organizationId: organization1.id,
      });

      databaseBuilder.factory.buildOrganizationLearner({
        userId: user3.id,
        organizationId: organization2.id,
      });

      const campaign = databaseBuilder.factory.buildCampaign({
        organizationId: organization1.id,
        type: CampaignTypes.ASSESSMENT,
      });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        organizationLearnerId: organizationLearner2.id,
        userId: user1.id,
      });

      await databaseBuilder.commit();

      // when
      const apiResponse = await organizationLearnersWithParticipationsApi.find({ userIds });
      // then
      expect(apiResponse).to.have.lengthOf(3);
      expect(apiResponse[0]).to.be.instanceOf(OrganizationLearnerWithParticipations);
      expect(apiResponse[1]).to.be.instanceOf(OrganizationLearnerWithParticipations);
      expect(apiResponse[2]).to.be.instanceOf(OrganizationLearnerWithParticipations);
      expect(apiResponse).to.have.deep.members([
        {
          organizationLearner: { id: organizationLearner1.id },
          organization: {
            id: organization1.id,
            isManagingStudents: false,
            tags: ['tag1', 'tag2'],
            type: 'SCO',
          },
          campaignParticipations: [],
        },
        {
          organizationLearner: { id: organizationLearner2.id },
          organization: { id: organization2.id, isManagingStudents: false, tags: [], type: 'PRO' },
          campaignParticipations: [
            {
              campaignId: campaign.id,
              campaignName: campaign.name,
              id: campaignParticipation.id,
              status: campaignParticipation.status,
              targetProfileId: campaign.targetProfileId,
            },
          ],
        },
        {
          organizationLearner: { id: organizationLearner3.id },
          organization: {
            id: organization1.id,
            isManagingStudents: false,
            tags: ['tag1', 'tag2'],
            type: 'SCO',
          },
          campaignParticipations: [],
        },
      ]);
    });
  });

  describe('#getByUserIdAndOrganizationId', function () {
    it('should return OrganizationLearnerWithParticipations given id', async function () {
      // given
      const organization1 = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
      const organization2 = databaseBuilder.factory.buildOrganization();

      const tag1 = databaseBuilder.factory.buildTag({ name: 'tag1' });
      const tag2 = databaseBuilder.factory.buildTag({ name: 'tag2' });

      databaseBuilder.factory.buildOrganizationTag({ organizationId: organization1.id, tagId: tag1.id });
      databaseBuilder.factory.buildOrganizationTag({ organizationId: organization1.id, tagId: tag2.id });

      const user1 = databaseBuilder.factory.buildUser();

      const organizationLearner1 = databaseBuilder.factory.buildOrganizationLearner({
        userId: user1.id,
        organizationId: organization1.id,
      });

      databaseBuilder.factory.buildOrganizationLearner({
        userId: user1.id,
        organizationId: organization2.id,
      });

      const campaign = databaseBuilder.factory.buildCampaign({
        organizationId: organization1.id,
        type: CampaignTypes.ASSESSMENT,
      });
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        campaignId: campaign.id,
        organizationLearnerId: organizationLearner1.id,
        userId: user1.id,
      });

      await databaseBuilder.commit();

      // when
      const apiResponse = await organizationLearnersWithParticipationsApi.getByUserIdAndOrganizationId({
        userId: user1.id,
        organizationId: organization1.id,
      });

      // then
      expect(apiResponse).to.be.instanceOf(OrganizationLearnerWithParticipations);
      expect(apiResponse).to.deep.equal({
        organizationLearner: {
          id: organizationLearner1.id,
        },
        organization: {
          id: organization1.id,
          isManagingStudents: organization1.isManagingStudents,
          tags: ['tag1', 'tag2'],
          type: organization1.type,
        },
        campaignParticipations: [
          {
            campaignId: campaign.id,
            campaignName: campaign.name,
            id: campaignParticipation.id,
            status: campaignParticipation.status,
            targetProfileId: campaign.targetProfileId,
          },
        ],
      });
    });
  });
});
