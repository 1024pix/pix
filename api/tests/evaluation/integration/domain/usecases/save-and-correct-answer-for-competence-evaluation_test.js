import { expect } from 'chai';
import sinon from 'sinon';

import { Answer } from '../../../../../src/evaluation/domain/models/Answer.js';
import { CompetenceEvaluation } from '../../../../../src/evaluation/domain/models/CompetenceEvaluation.js';
import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { PIX_COUNT_BY_LEVEL } from '../../../../../src/shared/constants.js';
import { AnswerStatus } from '../../../../../src/shared/domain/models/AnswerStatus.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Evaluation | Integration | Usecase | Save and correct answer for competence evaluation', function () {
  const skillIds = ['monAcquisA_Id', 'monAcquisB_Id', 'monAcquisC_Id'];

  const locale = 'fr';

  const buildUserAnsweringTheHighestSkill = async function () {
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
    const someAnswerId = databaseBuilder.factory.buildAnswer().id;
    const someOtherAssessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
    databaseBuilder.factory.buildKnowledgeElement({
      skillId: skillIds[0],
      earnedPix: PIX_COUNT_BY_LEVEL,
      userId,
      assessmentId: someOtherAssessmentId,
      answerId: someAnswerId,
      status: KnowledgeElement.StatusType.VALIDATED,
      source: KnowledgeElement.SourceType.DIRECT,
      competenceId: 'maCompetenceId',
      createdAt: new Date('2020-01-01'),
    });
    await databaseBuilder.commit();

    return { userId, assessmentDB };
  };

  it('should correct answer and save both answer and knowledge-elements', async function () {
    // given
    const { userId, assessmentDB } = await buildUserAnsweringTheHighestSkill();

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
    const keData = await knex('knowledge-elements')
      .select(['source', 'status', 'skillId'])
      .where({ userId })
      .orderBy('skillId', 'createdAt');
    sinon.assert.match(keData[0], {
      source: KnowledgeElement.SourceType.DIRECT,
      status: KnowledgeElement.StatusType.VALIDATED,
      skillId: skillIds[0],
    });
    sinon.assert.match(keData[1], {
      source: KnowledgeElement.SourceType.INFERRED,
      status: KnowledgeElement.StatusType.VALIDATED,
      skillId: skillIds[0],
    });
    sinon.assert.match(keData[2], {
      source: KnowledgeElement.SourceType.INFERRED,
      status: KnowledgeElement.StatusType.VALIDATED,
      skillId: skillIds[1],
    });
    sinon.assert.match(keData[3], {
      source: KnowledgeElement.SourceType.DIRECT,
      status: KnowledgeElement.StatusType.VALIDATED,
      skillId: skillIds[2],
    });
    expect(keData.length).to.equal(4);
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

  context('when the knowledge of the user is stored as knowledge states', function () {
    it('should correct answer and update the knowledge states instead of saving knowledge-elements', async function () {
      // given
      const { userId, assessmentDB } = await buildUserAnsweringTheHighestSkill();
      await evaluationUsecases.migrateUserToKnowledgeStates({ userId });

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
      const keData = await knex('knowledge-elements').where({ userId });
      const knowledgeStates = await knex('knowledge_states')
        .select(['tubeId', 'floor', 'ceiling', 'directLevels'])
        .where({ userId });
      const userCompetenceScores = await knex('user_competence_scores')
        .select(['competenceId', 'pix'])
        .where({ userId });

      expect(keData.length).to.equal(1);
      expect(knowledgeStates).to.deep.equal([{ tubeId: 'monTubeId', floor: 3, ceiling: null, directLevels: [1, 3] }]);
      expect(userCompetenceScores).to.deep.equal([{ competenceId: 'maCompetenceId', pix: 3 * PIX_COUNT_BY_LEVEL }]);
      sinon.assert.match(savedAnswer, {
        id: sinon.match.number,
        result: AnswerStatus.OK,
        levelup: {
          id: savedAnswer.id,
          competenceName: 'nom de la compétence',
          level: 3,
        },
      });
    });
  });
});
