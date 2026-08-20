import sinon from 'sinon';

import { Answer } from '../../../../../src/evaluation/domain/models/Answer.js';
import { CompetenceEvaluation } from '../../../../../src/evaluation/domain/models/CompetenceEvaluation.js';
import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { PIX_COUNT_BY_LEVEL } from '../../../../../src/shared/constants.js';
import { AnswerStatus } from '../../../../../src/shared/domain/models/AnswerStatus.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import * as knowledgeStateRepository from '../../../../../src/shared/infrastructure/repositories/knowledge-state-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Evaluation | Integration | Usecase | Save and correct answer for competence evaluation', function () {
  const skillIds = ['monAcquisA_Id', 'monAcquisB_Id', 'monAcquisC_Id'];

  it('should correct and save the answer, without persisting any knowledge element', async function () {
    // given
    const locale = 'fr';
    const competenceId = 'maCompetenceId';
    const userId = databaseBuilder.factory.buildUser().id;
    const assessmentDB = databaseBuilder.factory.buildAssessment({
      userId,
      competenceId,
      type: Assessment.types.COMPETENCE_EVALUATION,
      state: Assessment.states.STARTED,
    });
    databaseBuilder.factory.buildCompetenceEvaluation({
      userId,
      assessmentId: assessmentDB.id,
      competenceId,
      status: CompetenceEvaluation.statuses.STARTED,
    });
    databaseBuilder.factory.learningContent.buildArea({
      id: 'monAreaId',
    });
    databaseBuilder.factory.learningContent.buildCompetence({
      id: 'maCompetenceId',
      areaId: 'monAreaId',
      name_i18n: {
        fr: 'nom de la compétence',
      },
    });
    databaseBuilder.factory.learningContent.buildChallenge({
      id: 'monEpreuveId',
      skillId: skillIds[2],
      competenceId: 'maCompetenceId',
      locales: [locale],
      status: 'validé',
      solution: 'correct',
      proposals: '${a}',
      type: 'QROC',
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
    // Acquis déjà validé lors d'un parcours antérieur. Les knowledge elements
    // étant dérivés des réponses, ce passé s'exprime par une réponse, pas par
    // une ligne insérée à la main.
    databaseBuilder.factory.learningContent.buildChallenge({
      id: 'monEpreuvePrecedenteId',
      skillId: skillIds[0],
      competenceId: 'maCompetenceId',
      locales: [locale],
      status: 'validé',
    });
    const someOtherAssessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
    databaseBuilder.factory.buildAnsweredSkill({
      userId,
      assessmentId: someOtherAssessmentId,
      skillId: skillIds[0],
      challengeId: 'monEpreuvePrecedenteId',
      isOk: true,
      createdAt: new Date('2020-01-01'),
      withSkill: false,
      withChallenge: false,
    });
    await databaseBuilder.commit();

    // when
    const assessment = domainBuilder.buildAssessment(assessmentDB);
    const answer = new Answer({
      value: 'correct',
      challengeId: 'monEpreuveId',
      assessmentId: assessment.id,
    });
    const savedAnswer = await evaluationUsecases.saveAndCorrectAnswerForCompetenceEvaluation({
      answer,
      userId,
      assessment,
      locale,
      forceOKAnswer: false,
    });

    // then
    const knowledgeState = await knowledgeStateRepository.findByUserId({ userId });
    expect(knowledgeState.validatedSkills().map(({ id }) => id)).to.have.members(skillIds);
    expect(knowledgeState.isDirect({ id: skillIds[0], tubeId: 'monTubeId', difficulty: 1 })).to.be.true;
    expect(knowledgeState.isDirect({ id: skillIds[1], tubeId: 'monTubeId', difficulty: 2 })).to.be.false;
    expect(knowledgeState.isDirect({ id: skillIds[2], tubeId: 'monTubeId', difficulty: 3 })).to.be.true;
    sinon.assert.match(savedAnswer, {
      id: sinon.match.number,
      result: AnswerStatus.OK,
      levelup: {
        id: savedAnswer.id,
        competenceName: 'nom de la compétence',
        level: 3,
      },
    });
    expect(savedAnswer).to.be.instanceOf(Answer);
  });
});
