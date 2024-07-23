import { CampaignParticipationStatuses, CampaignTypes } from '../../../../../lib/domain/models/index.js';
import { ParticipationResultCalculationJobHandler } from '../../../../../src/shared/infrastructure/jobs/campaign-result/ParticipationResultCalculationJobHandler.js';
import { databaseBuilder, expect, knex, learningContentBuilder, mockLearningContent } from '../../../../test-helper.js';

describe('Integration | Infrastructure | Jobs | CampaignResult | ParticipationResultCalculationJobHandler', function () {
  describe('#handle', function () {
    let participationId;

    beforeEach(async function () {
      const learningContentObjects = learningContentBuilder.fromAreas([
        {
          id: 'recArea1',
          title_i18n: {
            fr: 'area1_Title',
          },
          color: 'specialColor',
          competences: [
            {
              id: 'recCompetence1',
              name: 'Fabriquer un meuble',
              index: '1.1',
              tubes: [
                {
                  id: 'recTube1',
                  skills: [{ id: 'recSkillId1', nom: '@web1', challenges: [] }],
                },
              ],
            },
          ],
        },
      ]);
      mockLearningContent(learningContentObjects);

      const { id: campaignId, organizationId } = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.ASSESSMENT,
      });
      const sharedAt = new Date();
      databaseBuilder.factory.buildCampaignSkill({ campaignId, skillId: 'recSkillId1' });
      const learner = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      participationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        organizationLearnerId: learner.id,
        userId: learner.userId,
        status: CampaignParticipationStatuses.SHARED,
        sharedAt,
      }).id;
      const ke = databaseBuilder.factory.buildKnowledgeElement({ skillId: 'recSkillId1', userId: learner.userId });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        userId: learner.userId,
        snappedAt: sharedAt,
        snapshot: JSON.stringify([ke]),
      });

      await databaseBuilder.commit();
    });

    it('should compute masteryRate', async function () {
      const handler = new ParticipationResultCalculationJobHandler();
      await handler.handle({ campaignParticipationId: participationId });
      const result = await knex('campaign-participations').where({ id: participationId }).first();
      expect(result.masteryRate).to.be.ok;
    });
  });
});
