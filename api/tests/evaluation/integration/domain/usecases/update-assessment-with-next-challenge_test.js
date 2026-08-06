import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { CampaignTypes } from '../../../../../src/prescription/shared/domain/constants.js';
import { KnowledgeElementCollection } from '../../../../../src/prescription/shared/domain/models/KnowledgeElementCollection.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Evaluation | Integration | Domain | Use Cases | update-assessment-with-next-challenge', function () {
  const skillIds = ['acquisTube1Niveau1', 'acquisTube1Niveau2'];

  context('for a campaign of type exam', function () {
    it('should return the next challenge and the global progression of the participant', async function () {
      // given
      const locale = 'fr';
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
      const assessment = databaseBuilder.factory.buildAssessment({
        campaignParticipationId,
        type: Assessment.types.CAMPAIGN,
        state: Assessment.states.STARTED,
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
        userId: assessment.userId,
        assessmentId: assessment.id,
        challengeId: 'autrechose',
      }).id;
      const knowledgeElement = domainBuilder.buildKnowledgeElement({
        answerId,
        assessmentId: assessment.id,
        userId: assessment.userId,
        skillId: skillIds[0],
        status: KnowledgeElement.StatusType.VALIDATED,
        source: KnowledgeElement.SourceType.DIRECT,
        competenceId: 'maCompetenceId',
        createdAt: new Date('2020-01-01'),
      });
      databaseBuilder.factory.buildKnowledgeElementSnapshot({
        campaignParticipationId,
        snapshot: new KnowledgeElementCollection([knowledgeElement]).toSnapshot(),
      });
      await databaseBuilder.commit();

      // when
      const { assessment: assessmentWithNextChallenge, globalProgression } =
        await evaluationUsecases.updateAssessmentWithNextChallenge({
          assessmentId: assessment.id,
          locale,
        });

      // then
      expect(assessmentWithNextChallenge.nextChallenge.id).to.equal(challengeData[1].id);
      expect(globalProgression).to.equal(0.5);
    });
  });
});
