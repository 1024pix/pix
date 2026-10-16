import { expect } from 'chai';

import { evaluationUsecases } from '../../../../../src/evaluation/domain/usecases/index.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { getServer } from '../../../../tooling/server/shared-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Acceptance | Controller | answer-controller-save | with knowledge states', function () {
  const competenceId = 'recCompetence';
  const challengeId = 'challenge_web_3';
  let server;

  const buildLearningContent = () =>
    databaseBuilder.factory.learningContent.build({
      areas: [
        { id: 'recArea', title_i18n: { fr: 'Domaine' }, color: 'jaffa', code: '1', competenceIds: [competenceId] },
      ],
      competences: [
        {
          id: competenceId,
          areaId: 'recArea',
          origin: 'Pix',
          index: '1.1',
          name_i18n: { fr: 'Nom de la compétence' },
          description_i18n: { fr: 'Une description' },
        },
      ],
      skills: [1, 2, 3, 4].map((level) => ({
        id: `skill_web_${level}`,
        name: `@web${level}`,
        status: 'actif',
        competenceId,
        tubeId: 'tube_web',
        level,
        pixValue: 2,
      })),
      challenges: [
        {
          id: challengeId,
          competenceId,
          skillId: 'skill_web_3',
          status: 'validé',
          solution: 'correct',
          proposals: '${a}',
          locales: ['fr-fr'],
          type: 'QROC',
        },
      ],
    });

  // A user who validated level 1 in an earlier assessment, and is asked level 3 in a new one.
  const buildUser = () => {
    const userId = databaseBuilder.factory.buildUser().id;
    const earlierAssessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
    databaseBuilder.factory.buildKnowledgeElement({
      userId,
      assessmentId: earlierAssessmentId,
      skillId: 'skill_web_1',
      competenceId,
      status: KnowledgeElement.StatusType.VALIDATED,
      source: KnowledgeElement.SourceType.DIRECT,
      earnedPix: 2,
      createdAt: new Date('2020-01-01'),
    });
    const assessmentId = databaseBuilder.factory.buildAssessment({
      userId,
      competenceId,
      type: Assessment.types.COMPETENCE_EVALUATION,
      state: Assessment.states.STARTED,
    }).id;
    databaseBuilder.factory.buildCompetenceEvaluation({ userId, assessmentId, competenceId });

    return { userId, assessmentId };
  };

  const answer = ({ userId, assessmentId }) =>
    server.inject({
      method: 'POST',
      url: '/api/answers',
      headers: generateAuthenticatedUserRequestHeaders({ userId }),
      payload: {
        data: {
          type: 'answers',
          attributes: { value: 'correct' },
          relationships: {
            assessment: { data: { type: 'assessments', id: assessmentId } },
            challenge: { data: { type: 'challenges', id: challengeId } },
          },
        },
      },
    });

  const getProfile = async ({ userId }) => {
    const response = await server.inject({
      method: 'GET',
      url: `/api/users/${userId}/profile`,
      headers: generateAuthenticatedUserRequestHeaders({ userId }),
    });
    const scorecard = response.result.included.find(({ type }) => type === 'scorecards');

    return {
      statusCode: response.statusCode,
      pixScore: response.result.data.attributes['pix-score'],
      scorecard: {
        earnedPix: scorecard.attributes['earned-pix'],
        level: scorecard.attributes.level,
        pixScoreAheadOfNextLevel: scorecard.attributes['pix-score-ahead-of-next-level'],
        status: scorecard.attributes.status,
      },
    };
  };

  beforeEach(async function () {
    server = await getServer();
  });

  it('should give a migrated user the same profile as another user, before and after the same answer', async function () {
    // given
    buildLearningContent();
    const migratedUser = buildUser();
    const otherUser = buildUser();
    await databaseBuilder.commit();
    await evaluationUsecases.migrateUserToKnowledgeStates({ userId: migratedUser.userId });

    // when
    const migratedUserProfileBefore = await getProfile(migratedUser);
    const otherUserProfileBefore = await getProfile(otherUser);
    const migratedUserResponse = await answer(migratedUser);
    const otherUserResponse = await answer(otherUser);
    const migratedUserProfileAfter = await getProfile(migratedUser);
    const otherUserProfileAfter = await getProfile(otherUser);

    // then
    expect(migratedUserProfileBefore).to.deep.equal(otherUserProfileBefore);
    expect(migratedUserProfileBefore.pixScore).to.equal(2);

    expect(migratedUserResponse.statusCode).to.equal(201);
    expect(otherUserResponse.statusCode).to.equal(201);
    expect(migratedUserResponse.result.data.attributes.result).to.equal('ok');

    expect(migratedUserProfileAfter).to.deep.equal(otherUserProfileAfter);
    expect(migratedUserProfileAfter.pixScore).to.equal(6);
  });

  it('should keep the knowledge of a migrated user in the knowledge states only', async function () {
    // given
    buildLearningContent();
    const migratedUser = buildUser();
    await databaseBuilder.commit();
    await evaluationUsecases.migrateUserToKnowledgeStates({ userId: migratedUser.userId });

    // when
    await answer(migratedUser);

    // then
    const knowledgeElements = await knex('knowledge-elements').where({ userId: migratedUser.userId });
    const knowledgeStates = await knex('knowledge_states')
      .select('tubeId', 'floor', 'ceiling', 'directLevels')
      .where({ userId: migratedUser.userId });
    const userCompetenceScores = await knex('user_competence_scores')
      .select('competenceId', 'pix')
      .where({ userId: migratedUser.userId });

    expect(knowledgeElements).to.have.lengthOf(1);
    expect(knowledgeStates).to.deep.equal([{ tubeId: 'tube_web', floor: 3, ceiling: null, directLevels: [1, 3] }]);
    expect(userCompetenceScores).to.deep.equal([{ competenceId, pix: 6 }]);
  });
});
