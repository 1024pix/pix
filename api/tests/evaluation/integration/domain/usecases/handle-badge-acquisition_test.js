import sinon from 'sinon';

import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { CampaignTypes } from '../../../../../src/prescription/shared/domain/constants.js';
import { PIX_COUNT_BY_LEVEL } from '../../../../../src/shared/constants.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { SCOPES } from '../../../../../src/shared/domain/models/BadgeDetails.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';
import { toLegacySnapshot } from '../../../../tooling/knowledge-state/legacy-snapshot.js';

const buildKeData = (data) => ({
  source: 'direct',
  status: 'validated',
  earnedPix: 4,
  skillId: 'recSKIL123',
  competenceId: 'recCOMP456',
  ...data,
});

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
      // Le premier acquis est réussi, le second raté : les knowledge elements
      // se dérivent de ces réponses.
      databaseBuilder.factory.buildAnsweredSkill({
        userId,
        assessmentId: assessmentDB.id,
        skillId: skillIds[0],
        competenceId: 'maCompetenceId',
        isOk: true,
        createdAt: new Date('2020-01-01'),
        withSkill: false,
      });
      databaseBuilder.factory.buildAnsweredSkill({
        userId,
        assessmentId: assessmentDB.id,
        skillId: skillIds[1],
        competenceId: 'maCompetenceId',
        isOk: false,
        createdAt: new Date('2020-01-02'),
        withSkill: false,
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
      const ke1 = buildKeData({
        skillId: skillIds[0],
        earnedPix: PIX_COUNT_BY_LEVEL,
        userId,
        answerId: 123,
        status: 'validated',
        source: 'direct',
        competenceId: 'maCompetenceId',
        createdAt: new Date('2020-01-01'),
      });
      const ke2 = buildKeData({
        skillId: skillIds[1],
        earnedPix: PIX_COUNT_BY_LEVEL,
        userId,
        answerId: 456,
        status: 'invalidated',
        source: 'direct',
        competenceId: 'maCompetenceId',
        createdAt: new Date('2020-01-01'),
      });
      const knowledgeElementsBefore = toLegacySnapshot([ke1, ke2]);
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId,
        snapshot: knowledgeElementsBefore,
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

  context('when assessment is not linked to a campaign', function () {
    it('should not throw', async function () {
      const userId = databaseBuilder.factory.buildUser().id;

      const assessmentDB = databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId: null,
        type: Assessment.types.CAMPAIGN,
      });

      await databaseBuilder.commit();

      const assessment = domainBuilder.buildAssessment(assessmentDB);
      const result = evaluationUsecases.handleBadgeAcquisition({ assessment });

      await expect(result).to.fulfilled;
    });
  });
});
