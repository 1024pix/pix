import { expect } from 'chai';

import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import { KnowledgeElement } from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { getServer } from '../../../../tooling/server/shared-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

const {
  buildAssessment,
  buildCompetenceEvaluation,
  buildKnowledgeElement,
  buildKnowledgeState,
  buildKnowledgeStateMigration,
  buildUser,
  buildUserCompetenceScore,
  learningContent,
} = databaseBuilder.factory;

describe('Acceptance | Controller | answer-controller-save | with knowledge states', function () {
  const competenceId = 'recCompetence';
  const challengeId = 'challenge_web_3';
  let server;

  const buildLearningContent = () =>
    learningContent.build({
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
  const buildAssessedUser = () => {
    const userId = buildUser().id;
    const earlierAssessmentId = buildAssessment({ userId }).id;
    buildKnowledgeElement({
      userId,
      assessmentId: earlierAssessmentId,
      skillId: 'skill_web_1',
      competenceId,
      status: KnowledgeElement.StatusType.VALIDATED,
      source: KnowledgeElement.SourceType.DIRECT,
      earnedPix: 2,
      createdAt: new Date('2020-01-01'),
    });
    const assessmentId = buildAssessment({
      userId,
      competenceId,
      type: Assessment.types.COMPETENCE_EVALUATION,
      state: Assessment.states.STARTED,
    }).id;
    buildCompetenceEvaluation({ userId, assessmentId, competenceId });

    return { userId, assessmentId };
  };

  // What the migration of the user writes: their level 1, the pix score it earned, and the migration row.
  const migrate = async (user) => {
    buildKnowledgeState({ userId: user.userId, tubeId: 'tube_web', floor: 1, directLevels: [1] });
    buildUserCompetenceScore({ userId: user.userId, competenceId, pix: 2 });
    buildKnowledgeStateMigration({ userId: user.userId });
    await databaseBuilder.commit();

    return user;
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
    const migratedUser = await migrate(buildAssessedUser());
    const otherUser = buildAssessedUser();
    await databaseBuilder.commit();

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

  it('should keep the knowledge of a migrated user in the knowledge states and save into migrated user knowledge elements', async function () {
    // given
    buildLearningContent();
    const migratedUser = await migrate(buildAssessedUser());

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
    const { id: answerId } = await knex('answers').where({ assessmentId: migratedUser.assessmentId }).first();
    const savedKnowledgeElements = await knex('migrated_user_knowledge_elements')
      .select('skillId', 'status', 'source', 'earnedPix', 'answerId', 'assessmentId', 'savedAt')
      .where({ userId: migratedUser.userId })
      .orderBy('skillId');

    expect(knowledgeElements).to.have.lengthOf(1);
    expect(knowledgeStates).to.deep.equal([{ tubeId: 'tube_web', floor: 3, ceiling: null, directLevels: [1, 3] }]);
    expect(userCompetenceScores).to.deep.equal([{ competenceId, pix: 6 }]);
    expect(savedKnowledgeElements).to.deep.equal([
      {
        skillId: 'skill_web_1',
        status: 'validated',
        source: 'inferred',
        earnedPix: 2,
        answerId,
        assessmentId: migratedUser.assessmentId,
        savedAt: null,
      },
      {
        skillId: 'skill_web_2',
        status: 'validated',
        source: 'inferred',
        earnedPix: 2,
        answerId,
        assessmentId: migratedUser.assessmentId,
        savedAt: null,
      },
      {
        skillId: 'skill_web_3',
        status: 'validated',
        source: 'direct',
        earnedPix: 2,
        answerId,
        assessmentId: migratedUser.assessmentId,
        savedAt: null,
      },
    ]);
  });
});
