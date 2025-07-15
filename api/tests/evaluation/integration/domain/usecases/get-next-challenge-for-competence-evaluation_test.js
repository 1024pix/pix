import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { Assessment, KnowledgeElement } from '../../../../../src/shared/domain/models/index.js';
import { databaseBuilder, domainBuilder, expect } from '../../../../test-helper.js';

describe('Evaluation | Integration | Domain | Use Cases | get-next-challenge-for-competence-evaluation', function () {
  const skillIds = ['acquisTube1Niveau1', 'acquisTube1Niveau2'];

  it('should return the next challenge id for the participant according to the user profile', async function () {
    // given
    const locale = 'fr';
    const userId = databaseBuilder.factory.buildUser().id;
    const assessmentDB = databaseBuilder.factory.buildAssessment({
      userId,
      type: Assessment.types.COMPETENCE_EVALUATION,
      competenceId: 'recCompetenceId',
    });
    const challengeData = [];
    skillIds.map((skillId, index) => {
      databaseBuilder.factory.learningContent.buildSkill({
        id: skillId,
        tubeId: 'tube1Id',
        status: 'actif',
        level: index + 1,
        competenceId: 'recCompetenceId',
      });
      challengeData.push(
        databaseBuilder.factory.learningContent.buildChallenge({
          id: `challengeFor_${skillId}`,
          tubeId: 'tube1Id',
          status: 'validé',
          locales: [locale],
          skillId,
          competenceId: 'recCompetenceId',
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
      competenceId: 'recCompetenceId',
      createdAt: new Date('2020-01-01'),
    });
    await databaseBuilder.commit();

    // when
    const assessment = domainBuilder.buildAssessment(assessmentDB);
    const challengeId = await evaluationUsecases.getNextChallengeForCompetenceEvaluation({
      assessment,
      locale,
      userId,
    });

    // then
    expect(challengeId).to.equal(challengeData[1].id);
  });
});
