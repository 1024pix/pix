import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { CampaignTypes } from '../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { PIX_COUNT_BY_LEVEL } from '../../../../../src/shared/domain/constants.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { SCOPES } from '../../../../../src/shared/domain/models/BadgeDetails.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/index.js';
import { databaseBuilder, domainBuilder, expect, knex, sinon } from '../../../../test-helper.js';

describe('Integration | Usecase | Handle Badge Acquisition', function () {
  context('when campaign is of type ASSESSMENT', function () {
    it('should compute badge acquisition based on knowledge-elements from user profile', async function () {
      // given
      const skillIds = ['acquisA', 'acquisB'];
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const badgeId1 = databaseBuilder.factory.buildBadge({
        key: 'BADGE_1_KEY',
        targetProfileId,
      }).id;
      databaseBuilder.factory.buildBadgeCriterion({
        scope: SCOPES.CAMPAIGN_PARTICIPATION,
        threshold: 20,
        badgeId: badgeId1,
      });
      const badgeId2 = databaseBuilder.factory.buildBadge({
        key: 'BADGE_2_KEY',
        targetProfileId,
      }).id;
      databaseBuilder.factory.buildBadgeCriterion({
        scope: SCOPES.CAMPAIGN_PARTICIPATION,
        threshold: 100,
        badgeId: badgeId2,
      });
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.ASSESSMENT, targetProfileId }).id;
      skillIds.map((skillId) =>
        databaseBuilder.factory.buildCampaignSkill({
          campaignId,
          skillId,
        }),
      );
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId,
      }).id;
      const assessmentDB = databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId,
        type: Assessment.types.CAMPAIGN,
      });
      skillIds.map((id, index) =>
        databaseBuilder.factory.learningContent.buildSkill({
          id,
          competenceId: 'maCompetenceId',
          pixValue: PIX_COUNT_BY_LEVEL,
          status: 'actif',
          tubeId: 'monTubeId',
          level: index + 1,
        }),
      );
      databaseBuilder.factory.buildKnowledgeElement({
        skillId: skillIds[0],
        earnedPix: PIX_COUNT_BY_LEVEL,
        userId,
        assessmentId: assessmentDB.id,
        answerId: databaseBuilder.factory.buildAnswer().id,
        status: KnowledgeElement.StatusType.VALIDATED,
        source: KnowledgeElement.SourceType.DIRECT,
        competenceId: 'maCompetenceId',
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildKnowledgeElement({
        skillId: skillIds[1],
        earnedPix: PIX_COUNT_BY_LEVEL,
        userId,
        assessmentId: assessmentDB.id,
        answerId: databaseBuilder.factory.buildAnswer().id,
        status: KnowledgeElement.StatusType.INVALIDATED,
        source: KnowledgeElement.SourceType.DIRECT,
        competenceId: 'maCompetenceId',
        createdAt: new Date('2020-01-01'),
      });
      await databaseBuilder.commit();

      // when
      const assessment = domainBuilder.buildAssessment(assessmentDB);
      await evaluationUsecases.handleBadgeAcquisition({ assessment });

      // then
      const allBadgeAcquisitionsDB = await knex('badge-acquisitions').select('*').orderBy('badgeId');
      expect(allBadgeAcquisitionsDB.length).to.equal(1);
      sinon.assert.match(allBadgeAcquisitionsDB[0], {
        badgeId: badgeId1,
        campaignParticipationId,
        userId,
      });
    });
  });
  context('when campaign is of type EXAM', function () {
    it('should compute badge acquisition based on knowledge-elements from user profile', async function () {
      // given
      const skillIds = ['acquisA', 'acquisB'];
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const badgeId1 = databaseBuilder.factory.buildBadge({
        key: 'BADGE_1_KEY',
        targetProfileId,
      }).id;
      databaseBuilder.factory.buildBadgeCriterion({
        scope: SCOPES.CAMPAIGN_PARTICIPATION,
        threshold: 20,
        badgeId: badgeId1,
      });
      const badgeId2 = databaseBuilder.factory.buildBadge({
        key: 'BADGE_2_KEY',
        targetProfileId,
      }).id;
      databaseBuilder.factory.buildBadgeCriterion({
        scope: SCOPES.CAMPAIGN_PARTICIPATION,
        threshold: 100,
        badgeId: badgeId2,
      });
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ type: CampaignTypes.EXAM, targetProfileId }).id;
      skillIds.map((skillId) =>
        databaseBuilder.factory.buildCampaignSkill({
          campaignId,
          skillId,
        }),
      );
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        userId,
      }).id;
      const assessmentDB = databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId,
        type: Assessment.types.CAMPAIGN,
      });
      skillIds.map((id, index) =>
        databaseBuilder.factory.learningContent.buildSkill({
          id,
          competenceId: 'maCompetenceId',
          pixValue: PIX_COUNT_BY_LEVEL,
          status: 'actif',
          tubeId: 'monTubeId',
          level: index + 1,
        }),
      );
      const ke1 = domainBuilder.buildKnowledgeElement({
        skillId: skillIds[0],
        earnedPix: PIX_COUNT_BY_LEVEL,
        userId,
        answerId: 123,
        status: KnowledgeElement.StatusType.VALIDATED,
        source: KnowledgeElement.SourceType.DIRECT,
        competenceId: 'maCompetenceId',
        createdAt: new Date('2020-01-01'),
      });
      const ke2 = domainBuilder.buildKnowledgeElement({
        skillId: skillIds[1],
        earnedPix: PIX_COUNT_BY_LEVEL,
        userId,
        answerId: 456,
        status: KnowledgeElement.StatusType.INVALIDATED,
        source: KnowledgeElement.SourceType.DIRECT,
        competenceId: 'maCompetenceId',
        createdAt: new Date('2020-01-01'),
      });
      const knowledgeElementsBefore = new KnowledgeElementCollection([ke1, ke2]);
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId,
        snapshot: knowledgeElementsBefore.toSnapshot(),
      });
      await databaseBuilder.commit();

      // when
      const assessment = domainBuilder.buildAssessment(assessmentDB);
      await evaluationUsecases.handleBadgeAcquisition({ assessment });

      // then
      const allBadgeAcquisitionsDB = await knex('badge-acquisitions').select('*').orderBy('badgeId');
      expect(allBadgeAcquisitionsDB.length).to.equal(1);
      sinon.assert.match(allBadgeAcquisitionsDB[0], {
        badgeId: badgeId1,
        campaignParticipationId,
        userId,
      });
    });
  });
});
