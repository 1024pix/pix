import { expect } from 'chai';
import sinon from 'sinon';

import { MAX_REACHABLE_PIX_BY_COMPETENCE } from '../../../../../src/shared/constants.js';
import { type Skill } from '../../../../../src/shared/domain/models/Skill.js';
import {
  type KnowledgeElementToSimulate,
  simulateKnowledgeStateMigration,
} from '../../../../../src/shared/domain/usecases/simulate-knowledge-state-migration.ts';
import { buildSkill, learningContent } from '../../../../tooling/knowledge-state/answer-sequences.ts';

const buildKnowledgeElementOf = (
  tube: string,
  level: number,
  overrides: Partial<KnowledgeElementToSimulate> = {},
): KnowledgeElementToSimulate => {
  const skill = buildSkill(tube, level);
  return {
    skillId: skill.id,
    competenceId: skill.competenceId,
    status: 'validated',
    source: 'direct',
    earnedPix: 0,
    createdAt: new Date('2026-01-10'),
    ...overrides,
  };
};

describe('Unit | Shared | Domain | UseCase | simulate-knowledge-state-migration', function () {
  it('should give the knowledge states and the competence scores of the knowledge elements, without user', async function () {
    // given: tube full known up to level 2 and failed at level 3, a skill the learning content does not know
    const skillRepository = { list: sinon.stub<[], Promise<Skill[]>>().resolves(learningContent) };
    const knowledgeElements = [
      buildKnowledgeElementOf('full', 2, { earnedPix: 1 }),
      buildKnowledgeElementOf('full', 1, { source: 'inferred', earnedPix: 0.5 }),
      buildKnowledgeElementOf('full', 3, { status: 'invalidated', createdAt: new Date('2026-01-12') }),
      { ...buildKnowledgeElementOf('full', 1, { earnedPix: 10 }), skillId: 'skill_gone' },
    ];

    // when
    const simulation = await simulateKnowledgeStateMigration({ knowledgeElements, skillRepository });

    // then
    expect(simulation).to.deep.equal({
      knowledgeElementCount: 4,
      knowledgeStateCount: 1,
      knowledgeStates: [
        {
          tubeId: 'tube_full',
          floor: 2,
          ceiling: 3,
          ceilingAt: new Date('2026-01-12'),
          directLevels: [2, 3],
          updatedAt: new Date('2026-01-12'),
        },
      ],
      userCompetenceScores: [
        {
          competenceId: 'competence_full',
          pix: 11.5,
          pixFromKnowledgeStates: 1.5,
          displayedPix: 11,
          displayedPixAfterMigration: 11,
        },
      ],
      pixScore: 11,
      pixScoreAfterMigration: 11,
      unknownSkillIds: ['skill_gone'],
    });
  });

  it('should keep the latest knowledge element of each skill and leave the resets out, as the migration reads them', async function () {
    // given: level 1 failed then validated, level 2 validated then reset
    const skillRepository = { list: sinon.stub<[], Promise<Skill[]>>().resolves(learningContent) };
    const knowledgeElements = [
      buildKnowledgeElementOf('full', 1, { status: 'invalidated', createdAt: new Date('2026-01-05') }),
      buildKnowledgeElementOf('full', 1, { earnedPix: 0.5, createdAt: new Date('2026-01-10') }),
      buildKnowledgeElementOf('full', 2, { earnedPix: 1, createdAt: new Date('2026-01-05') }),
      buildKnowledgeElementOf('full', 2, { status: 'reset', createdAt: new Date('2026-01-10') }),
    ];

    // when
    const simulation = await simulateKnowledgeStateMigration({ knowledgeElements, skillRepository });

    // then
    expect(simulation.knowledgeElementCount).to.equal(1);
    expect(
      simulation.knowledgeStates.map(({ floor, ceiling, directLevels }) => ({ floor, ceiling, directLevels })),
    ).to.deep.equal([{ floor: 1, ceiling: null, directLevels: [1] }]);
    expect(simulation.userCompetenceScores.map(({ competenceId, pix }) => ({ competenceId, pix }))).to.deep.equal([
      { competenceId: 'competence_full', pix: 0.5 },
    ]);
  });

  it('should give the pix score the profile would show, each competence rounded down and capped at the product maximum', async function () {
    // given: competence full far above the cap, competence gaps under it
    const skillRepository = { list: sinon.stub<[], Promise<Skill[]>>().resolves(learningContent) };
    const knowledgeElements = [
      buildKnowledgeElementOf('full', 1, { earnedPix: 30 }),
      buildKnowledgeElementOf('full', 2, { earnedPix: 30 }),
      buildKnowledgeElementOf('gaps', 1, { earnedPix: 3.9 }),
    ];

    // when
    const simulation = await simulateKnowledgeStateMigration({ knowledgeElements, skillRepository });

    // then
    expect(simulation.userCompetenceScores.map(({ competenceId, pix }) => ({ competenceId, pix }))).to.deep.equal([
      { competenceId: 'competence_full', pix: 60 },
      { competenceId: 'competence_gaps', pix: 3.9 },
    ]);
    expect(simulation.pixScore).to.equal(MAX_REACHABLE_PIX_BY_COMPETENCE + 3);
  });

  it('should give the score the profile would show after the migration, lost on a competence whose knowledge states are worth nothing', async function () {
    // given: competence full known on a skill of the learning content, competence gone only on a skill it does not know
    const skillRepository = { list: sinon.stub<[], Promise<Skill[]>>().resolves(learningContent) };
    const knowledgeElements = [
      buildKnowledgeElementOf('full', 1, { earnedPix: 7.5 }),
      {
        ...buildKnowledgeElementOf('full', 1, { earnedPix: 4 }),
        skillId: 'skill_gone',
        competenceId: 'competence_gone',
      },
    ];

    // when
    const simulation = await simulateKnowledgeStateMigration({ knowledgeElements, skillRepository });

    // then
    expect(simulation.userCompetenceScores).to.deep.equal([
      {
        competenceId: 'competence_full',
        pix: 7.5,
        pixFromKnowledgeStates: 0.5,
        displayedPix: 7,
        displayedPixAfterMigration: 7,
      },
      {
        competenceId: 'competence_gone',
        pix: 4,
        pixFromKnowledgeStates: 0,
        displayedPix: 4,
        displayedPixAfterMigration: 0,
      },
    ]);
    expect(simulation.pixScore).to.equal(11);
    expect(simulation.pixScoreAfterMigration).to.equal(7);
  });
});
