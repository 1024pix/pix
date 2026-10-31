import { expect } from 'chai';
import sinon from 'sinon';

import { DomainTransaction } from '../../../../../src/shared/domain/DomainTransaction.js';
import {
  KnowledgeElement,
  type KnowledgeElementSource,
  type KnowledgeElementStatus,
} from '../../../../../src/shared/domain/models/KnowledgeElement.js';
import { KnowledgeState } from '../../../../../src/shared/domain/models/KnowledgeState.ts';
import { type Skill } from '../../../../../src/shared/domain/models/Skill.js';
import { UserCompetenceScore } from '../../../../../src/shared/domain/models/UserCompetenceScore.ts';
import { migrateUserToKnowledgeStates } from '../../../../../src/shared/domain/usecases/migrate-user-to-knowledge-states.ts';
import { buildSkill, learningContent, USER_ID } from '../../../../tooling/knowledge-state/answer-sequences.ts';

type DatedKnowledgeElement = KnowledgeElement & { createdAt: Date };

const buildKnowledgeElement = ({
  skillId,
  competenceId,
  status = 'validated',
  source = 'direct',
  earnedPix = 0,
  createdAt = new Date('2026-01-10'),
}: {
  skillId: string;
  competenceId?: string;
  status?: KnowledgeElementStatus;
  source?: KnowledgeElementSource;
  earnedPix?: number;
  createdAt?: Date;
}): DatedKnowledgeElement =>
  new KnowledgeElement({
    skillId,
    competenceId,
    status,
    source,
    earnedPix,
    createdAt,
    answerId: null,
    assessmentId: null,
    userId: USER_ID,
  }) as DatedKnowledgeElement;

const buildKnowledgeElementOf = (
  tube: string,
  level: number,
  overrides: { status?: KnowledgeElementStatus; source?: KnowledgeElementSource; earnedPix?: number } = {},
) => {
  const skill = buildSkill(tube, level);
  return buildKnowledgeElement({ skillId: skill.id, competenceId: skill.competenceId, ...overrides });
};

describe('Unit | Shared | Domain | UseCase | migrate-user-to-knowledge-states', function () {
  const buildDependencies = (knowledgeElements: DatedKnowledgeElement[], migrated = false) => ({
    knowledgeElementRepository: {
      findUniqByUserId: sinon
        .stub<[{ userId: number }], Promise<DatedKnowledgeElement[]>>()
        .resolves(knowledgeElements),
    },
    knowledgeStateRepository: {
      lockUser: sinon.stub<[number], Promise<void>>().resolves(),
      upsert: sinon.stub<[KnowledgeState[]], Promise<void>>().resolves(),
    },
    knowledgeStateMigrationRepository: {
      isMigrated: sinon.stub<[number], Promise<boolean>>().resolves(migrated),
      save: sinon.stub<[number, object], Promise<void>>().resolves(),
    },
    skillRepository: { list: sinon.stub<[], Promise<Skill[]>>().resolves(learningContent) },
    userCompetenceScoreRepository: { upsert: sinon.stub<[UserCompetenceScore[]], Promise<void>>().resolves() },
  });

  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
  });

  it('should store the knowledge of the user as knowledge states, with the score of each competence', async function () {
    // given: tube full known up to level 3 and failed from level 5, tube gaps failed at level 2
    const dependencies = buildDependencies([
      buildKnowledgeElementOf('full', 3, { earnedPix: 1.5 }),
      buildKnowledgeElementOf('full', 2, { source: 'inferred', earnedPix: 1 }),
      buildKnowledgeElementOf('full', 1, { source: 'inferred', earnedPix: 0.5 }),
      buildKnowledgeElementOf('full', 5, { status: 'invalidated' }),
      buildKnowledgeElementOf('gaps', 2, { status: 'invalidated' }),
    ]);

    // when
    const report = await migrateUserToKnowledgeStates({ userId: USER_ID, ...dependencies });

    // then
    sinon.assert.calledOnceWithExactly(dependencies.knowledgeStateRepository.lockUser, USER_ID);
    sinon.assert.callOrder(
      dependencies.knowledgeStateRepository.lockUser,
      dependencies.knowledgeStateMigrationRepository.isMigrated,
      dependencies.knowledgeElementRepository.findUniqByUserId,
    );
    sinon.assert.calledOnceWithExactly(dependencies.knowledgeElementRepository.findUniqByUserId, { userId: USER_ID });
    sinon.assert.calledOnce(dependencies.knowledgeStateRepository.upsert);
    const knowledgeStates = dependencies.knowledgeStateRepository.upsert.firstCall.args[0];
    expect(knowledgeStates).to.have.lengthOf(2);
    expect(knowledgeStates[0]).to.be.instanceOf(KnowledgeState);
    expect(
      knowledgeStates.map(({ userId, tubeId, floor, ceiling, directLevels }) => ({
        userId,
        tubeId,
        floor,
        ceiling,
        directLevels,
      })),
    ).to.have.deep.members([
      { userId: USER_ID, tubeId: 'tube_full', floor: 3, ceiling: 5, directLevels: [3, 5] },
      { userId: USER_ID, tubeId: 'tube_gaps', floor: 0, ceiling: 2, directLevels: [2] },
    ]);
    sinon.assert.calledOnce(dependencies.userCompetenceScoreRepository.upsert);
    const userCompetenceScores = dependencies.userCompetenceScoreRepository.upsert.firstCall.args[0];
    expect(userCompetenceScores).to.have.lengthOf(2);
    expect(userCompetenceScores[0]).to.be.instanceOf(UserCompetenceScore);
    expect(
      userCompetenceScores.map(({ userId, competenceId, pix }) => ({ userId, competenceId, pix })),
    ).to.have.deep.members([
      { userId: USER_ID, competenceId: 'competence_full', pix: 3 },
      { userId: USER_ID, competenceId: 'competence_gaps', pix: 0 },
    ]);
    const expectedReport = { knowledgeElementCount: 5, knowledgeStateCount: 2, unknownSkillIds: [] };
    expect(report).to.deep.equal(expectedReport);
    sinon.assert.calledOnceWithExactly(dependencies.knowledgeStateMigrationRepository.save, USER_ID, expectedReport);
  });

  it('should do nothing for a user already migrated', async function () {
    // given
    const dependencies = buildDependencies([buildKnowledgeElementOf('full', 1)], true);

    // when
    const report = await migrateUserToKnowledgeStates({ userId: USER_ID, ...dependencies });

    // then
    expect(report).to.equal(null);
    sinon.assert.notCalled(dependencies.knowledgeElementRepository.findUniqByUserId);
    sinon.assert.notCalled(dependencies.knowledgeStateRepository.upsert);
    sinon.assert.notCalled(dependencies.userCompetenceScoreRepository.upsert);
    sinon.assert.notCalled(dependencies.knowledgeStateMigrationRepository.save);
  });

  it('should keep the knowledge on skills the learning content does not know out of the knowledge states, but in the score', async function () {
    // given
    const dependencies = buildDependencies([
      buildKnowledgeElementOf('full', 1, { earnedPix: 0.5 }),
      buildKnowledgeElement({ skillId: 'skill_gone_1', competenceId: 'competence_full', earnedPix: 10 }),
      buildKnowledgeElement({ skillId: 'skill_gone_1', competenceId: 'competence_full', earnedPix: 10 }),
      buildKnowledgeElement({ skillId: 'skill_gone_2', competenceId: 'competence_gone', earnedPix: 4 }),
    ]);

    // when
    const report = await migrateUserToKnowledgeStates({ userId: USER_ID, ...dependencies });

    // then
    const knowledgeStates = dependencies.knowledgeStateRepository.upsert.firstCall.args[0];
    expect(knowledgeStates.map(({ tubeId }) => tubeId)).to.deep.equal(['tube_full']);
    const userCompetenceScores: UserCompetenceScore[] =
      dependencies.userCompetenceScoreRepository.upsert.firstCall.args[0];
    expect(userCompetenceScores.map(({ competenceId, pix }) => [competenceId, pix])).to.have.deep.members([
      ['competence_full', 20.5],
      ['competence_gone', 4],
    ]);
    expect(report).to.deep.equal({
      knowledgeElementCount: 4,
      knowledgeStateCount: 1,
      unknownSkillIds: ['skill_gone_1', 'skill_gone_2'],
    });
  });

  it('should store at most 64 pix on a competence', async function () {
    // given
    const dependencies = buildDependencies([
      buildKnowledgeElementOf('full', 1, { earnedPix: 40 }),
      buildKnowledgeElementOf('full', 2, { earnedPix: 40 }),
    ]);

    // when
    await migrateUserToKnowledgeStates({ userId: USER_ID, ...dependencies });

    // then
    const userCompetenceScores: UserCompetenceScore[] =
      dependencies.userCompetenceScoreRepository.upsert.firstCall.args[0];
    expect(userCompetenceScores.map(({ competenceId, pix }) => [competenceId, pix])).to.deep.equal([
      ['competence_full', 64],
    ]);
  });

  it('should leave the knowledge without competence out of the scores', async function () {
    // given
    const dependencies = buildDependencies([
      buildKnowledgeElementOf('full', 1, { earnedPix: 0.5 }),
      buildKnowledgeElement({ skillId: 'skill_gone', earnedPix: 10 }),
    ]);

    // when
    await migrateUserToKnowledgeStates({ userId: USER_ID, ...dependencies });

    // then
    const userCompetenceScores: UserCompetenceScore[] =
      dependencies.userCompetenceScoreRepository.upsert.firstCall.args[0];
    expect(userCompetenceScores.map(({ competenceId, pix }) => [competenceId, pix])).to.deep.equal([
      ['competence_full', 0.5],
    ]);
  });

  it('should store a user without knowledge as migrated, with nothing else', async function () {
    // given
    const dependencies = buildDependencies([]);

    // when
    const report = await migrateUserToKnowledgeStates({ userId: USER_ID, ...dependencies });

    // then
    sinon.assert.calledOnceWithExactly(dependencies.knowledgeStateRepository.upsert, []);
    sinon.assert.calledOnceWithExactly(dependencies.userCompetenceScoreRepository.upsert, []);
    const expectedReport = { knowledgeElementCount: 0, knowledgeStateCount: 0, unknownSkillIds: [] };
    expect(report).to.deep.equal(expectedReport);
    sinon.assert.calledOnceWithExactly(dependencies.knowledgeStateMigrationRepository.save, USER_ID, expectedReport);
  });
});
