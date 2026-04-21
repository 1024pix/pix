import { DetachedAssessment } from '../../../../../../src/prescription/campaign-participation/domain/read-models/DetachedAssessment.js';
import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';
import { Assessment } from '../../../../../../src/shared/domain/models/Assessment.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Integration | UseCase | find-user-anonymised-campaign-assessments', function () {
  let user, organization, campaign, learner;

  beforeEach(async function () {
    user = databaseBuilder.factory.buildUser();
    organization = databaseBuilder.factory.buildOrganization();
    campaign = databaseBuilder.factory.buildCampaign({ organizationId: organization.id });
    learner = databaseBuilder.factory.buildOrganizationLearner({ userId: user.id, organization: organization.id });
    await databaseBuilder.commit();
  });

  context('when there is no anonymised participation', function () {
    it('should return an empty array', async function () {
      // given
      const participation = databaseBuilder.factory.buildCampaignParticipation({
        userId: user.id,
        campaign: campaign.id,
        organizationLearnerId: learner.id,
      });
      databaseBuilder.factory.buildAssessment({
        type: Assessment.types.CAMPAIGN,
        userId: user.id,
        campaignParticipationId: participation.id,
      });
      await databaseBuilder.commit();

      // when
      const result = await usecases.findUserAnonymisedCampaignAssessments({ userId: user.id });

      // then
      expect(result).to.be.empty;
    });
  });

  context('when there is anonymised participation', function () {
    it('should return results', async function () {
      // given
      const assessment1 = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.CAMPAIGN,
        userId: user.id,
        campaignParticipationId: null,
        createdAt: new Date('2024-03-15'),
        updatedAt: new Date('2024-03-16'),
      });
      const assessment2 = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.CAMPAIGN,
        userId: user.id,
        state: Assessment.states.STARTED,
        campaignParticipationId: null,
        createdAt: new Date('2024-03-26'),
        updatedAt: new Date('2024-03-27'),
      });
      await databaseBuilder.commit();

      // when
      const result = await usecases.findUserAnonymisedCampaignAssessments({ userId: user.id });

      // then
      expect(result).lengthOf(2);
      expect(result[0]).instanceOf(DetachedAssessment);
      expect(result).deep.members([
        { id: assessment1.id, updatedAt: assessment1.updatedAt, state: assessment1.state },
        { id: assessment2.id, updatedAt: assessment2.updatedAt, state: assessment2.state },
      ]);
    });
  });
});
