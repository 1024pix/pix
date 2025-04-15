import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { CampaignTypes } from '../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { Assessment, KnowledgeElement } from '../../../../../src/shared/domain/models/index.js';
import { databaseBuilder, domainBuilder, expect } from '../../../../test-helper.js';

describe('Evaluation | Integration | Domain | Use Cases | get-next-challenge-for-campaign-assessment', function () {
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
      const answerId = databaseBuilder.factory.buildAnswer({
        userId,
        assessmentId: assessmentDB.id,
        challengeId: 'autrechose',
      }).id;
      databaseBuilder.factory.buildKnowledgeElement({
        answerId,
        assessmentId: assessmentDB.id,
        userId,
        skillId: skillIds[0],
        status: KnowledgeElement.StatusType.VALIDATED,
        source: KnowledgeElement.SourceType.DIRECT,
        competenceId: 'maCompetenceId',
        createdAt: new Date('2020-01-01'),
      });
      await databaseBuilder.commit();

      // when
      const assessment = domainBuilder.buildAssessment(assessmentDB);
      const challenge = await evaluationUsecases.getNextChallengeForCampaignAssessment({
        assessment,
        locale,
      });

      // then
      expect(challenge.id).to.equal(challengeData[1].id);
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
      const knowledgeElement = domainBuilder.buildKnowledgeElement({
        answerId,
        assessmentId: assessmentDB.id,
        userId,
        skillId: skillIds[0],
        status: KnowledgeElement.StatusType.VALIDATED,
        source: KnowledgeElement.SourceType.DIRECT,
        competenceId: 'maCompetenceId',
        createdAt: new Date('2020-01-01'),
      });
      const knowledgeElementsBefore = new KnowledgeElementCollection([knowledgeElement]);
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId,
        snapshot: knowledgeElementsBefore.toSnapshot(),
      });
      await databaseBuilder.commit();

      // when
      const assessment = domainBuilder.buildAssessment(assessmentDB);
      const challenge = await evaluationUsecases.getNextChallengeForCampaignAssessment({
        assessment,
        locale,
      });

      // then
      expect(challenge.id).to.equal(challengeData[1].id);
    });
  });
});
