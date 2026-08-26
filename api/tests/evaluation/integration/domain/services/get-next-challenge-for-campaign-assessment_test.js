import { services } from '../../../../../src/evaluation/domain/services/index.js';
import { CampaignTypes } from '../../../../../src/prescription/shared/domain/constants.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
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

describe('Evaluation | Integration | Domain | Services | get-next-challenge-for-campaign-assessment', function () {
  const skillIds = ['acquisTube1Niveau1', 'acquisTube1Niveau2'];

  context('for a campaign of type assessment with method smart_random', function () {
    it('should return the next challenge for the participant according to the user profile', async function () {
      // given
      const locale = 'fr';
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.ASSESSMENT,
      }).id;
      skillIds.map((skillId) =>
        databaseBuilder.factory.buildCampaignSkill({
          campaignId,
          skillId,
        }),
      );
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        sharedAt: null,
      }).id;
      const assessmentDB = databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId,
        type: Assessment.types.CAMPAIGN,
      });
      const challengeData = [];
      skillIds.map((skillId, index) => {
        databaseBuilder.factory.learningContent.buildSkill({
          id: skillId,
          tubeId: 'tube1Id',
          status: 'actif',
          level: index + 1,
        });
        challengeData.push(
          databaseBuilder.factory.learningContent.buildChallenge({
            id: `challengeFor_${skillId}`,
            tubeId: 'tube1Id',
            status: 'validé',
            locales: [locale],
            skillId,
          }),
        );
      });
      // L'acquis de niveau 1 est validé par une réponse à sa propre question :
      // les knowledge elements se dérivent des réponses.
      databaseBuilder.factory.buildAnswer({
        userId,
        assessmentId: assessmentDB.id,
        challengeId: `challengeFor_${skillIds[0]}`,
        result: 'ok',
        createdAt: new Date('2020-01-01'),
      });
      await databaseBuilder.commit();

      // when
      const assessment = domainBuilder.buildAssessment(assessmentDB);
      const challengeId = await services.getNextChallengeForCampaignAssessment({
        assessment,
        locale,
      });

      // then
      expect(challengeId).to.equal(challengeData[1].id);
    });
  });

  context('for a campaign of type exam with method smart_random', function () {
    it('should return the next challenge for the participant according to the user snapshot for campaign', async function () {
      // given
      const locale = 'fr';
      const userId = databaseBuilder.factory.buildUser().id;
      const campaignId = databaseBuilder.factory.buildCampaign({
        type: CampaignTypes.EXAM,
      }).id;
      skillIds.map((skillId) =>
        databaseBuilder.factory.buildCampaignSkill({
          campaignId,
          skillId,
        }),
      );
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({
        campaignId,
        sharedAt: null,
      }).id;
      const assessmentDB = databaseBuilder.factory.buildAssessment({
        userId,
        campaignParticipationId,
        type: Assessment.types.CAMPAIGN,
      });
      const challengeData = [];
      skillIds.map((skillId, index) => {
        databaseBuilder.factory.learningContent.buildSkill({
          id: skillId,
          tubeId: 'tube1Id',
          status: 'actif',
          level: index + 1,
        });
        challengeData.push(
          databaseBuilder.factory.learningContent.buildChallenge({
            id: `challengeFor_${skillId}`,
            tubeId: 'tube1Id',
            status: 'validé',
            locales: [locale],
            skillId,
          }),
        );
      });
      const answerId = databaseBuilder.factory.buildAnswer({
        userId,
        assessmentId: assessmentDB.id,
        challengeId: 'autrechose',
      }).id;
      const knowledgeElement = buildKeData({
        answerId,
        assessmentId: assessmentDB.id,
        userId,
        skillId: skillIds[0],
        status: 'validated',
        source: 'direct',
        competenceId: 'maCompetenceId',
        createdAt: new Date('2020-01-01'),
      });
      const knowledgeElementsBefore = toLegacySnapshot([knowledgeElement]);
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId,
        snapshot: knowledgeElementsBefore,
      });
      await databaseBuilder.commit();

      // when
      const assessment = domainBuilder.buildAssessment(assessmentDB);
      const challengeId = await services.getNextChallengeForCampaignAssessment({
        assessment,
        locale,
      });

      // then
      expect(challengeId).to.equal(challengeData[1].id);
    });
  });
});
