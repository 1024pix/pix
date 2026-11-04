import { expect } from 'chai';

import {
  KnowledgeElement,
  type KnowledgeElementSource,
  type KnowledgeElementStatus,
} from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { KnowledgeState } from '../../../../../../src/shared/domain/models/KnowledgeState.ts';
import { UserCompetenceScore } from '../../../../../../src/shared/domain/models/UserCompetenceScore.ts';
import { translateKnowledgeElements } from '../../../../../../src/shared/domain/services/knowledge-state/translate-knowledge-elements.ts';
import { buildSkill, learningContent, USER_ID } from '../../../../../tooling/knowledge-state/answer-sequences.ts';

const buildKnowledgeElement = ({
  skillId,
  competenceId,
  status = 'validated',
  source = 'direct',
  earnedPix = 0,
  createdAt = new Date('2026-01-10'),
}: {
  skillId: string;
  competenceId: string;
  status?: KnowledgeElementStatus;
  source?: KnowledgeElementSource;
  earnedPix?: number;
  createdAt?: Date;
}): KnowledgeElement =>
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
  });

const buildKnowledgeElementOf = (
  tube: string,
  level: number,
  overrides: { status?: KnowledgeElementStatus; source?: KnowledgeElementSource; earnedPix?: number } = {},
) => {
  const skill = buildSkill(tube, level);
  return buildKnowledgeElement({ skillId: skill.id, competenceId: skill.competenceId, ...overrides });
};

const translate = (knowledgeElements: KnowledgeElement[]) =>
  translateKnowledgeElements(USER_ID, knowledgeElements, learningContent);

describe('Unit | Shared | Domain | Services | knowledge-state | translate-knowledge-elements', function () {
  it('should build the knowledge states of the user, with the score of each competence', function () {
    // given: tube full known up to level 3 and failed from level 5, tube gaps failed at level 2
    const knowledgeElements = [
      buildKnowledgeElementOf('full', 3, { earnedPix: 1.5 }),
      buildKnowledgeElementOf('full', 2, { source: 'inferred', earnedPix: 1 }),
      buildKnowledgeElementOf('full', 1, { source: 'inferred', earnedPix: 0.5 }),
      buildKnowledgeElementOf('full', 5, { status: 'invalidated' }),
      buildKnowledgeElementOf('gaps', 2, { status: 'invalidated' }),
    ];

    // when
    const { knowledgeStates, userCompetenceScores, unknownSkillIds } = translate(knowledgeElements);

    // then
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
    expect(userCompetenceScores).to.have.lengthOf(2);
    expect(userCompetenceScores[0]).to.be.instanceOf(UserCompetenceScore);
    expect(
      userCompetenceScores.map(({ userId, competenceId, pix }) => ({ userId, competenceId, pix })),
    ).to.have.deep.members([
      { userId: USER_ID, competenceId: 'competence_full', pix: 3 },
      { userId: USER_ID, competenceId: 'competence_gaps', pix: 0 },
    ]);
    expect(unknownSkillIds).to.deep.equal([]);
  });

  describe('with knowledge on skills the learning content does not know', function () {
    const knowledgeElements = [
      buildKnowledgeElementOf('full', 1, { earnedPix: 0.5 }),
      buildKnowledgeElement({ skillId: 'skill_gone_1', competenceId: 'competence_full', earnedPix: 10 }),
      buildKnowledgeElement({ skillId: 'skill_gone_1', competenceId: 'competence_full', earnedPix: 10 }),
      buildKnowledgeElement({ skillId: 'skill_gone_2', competenceId: 'competence_gone', earnedPix: 4 }),
    ];

    it('should leave that knowledge out of the knowledge states', function () {
      // when
      const { knowledgeStates } = translate(knowledgeElements);

      // then
      expect(knowledgeStates.map(({ tubeId }) => tubeId)).to.deep.equal(['tube_full']);
    });

    it('should keep its pix in the score of its competence', function () {
      // when
      const { userCompetenceScores } = translate(knowledgeElements);

      // then
      expect(userCompetenceScores.map(({ competenceId, pix }) => [competenceId, pix])).to.have.deep.members([
        ['competence_full', 20.5],
        ['competence_gone', 4],
      ]);
    });

    it('should report each unknown skill once', function () {
      // when
      const { unknownSkillIds } = translate(knowledgeElements);

      // then
      expect(unknownSkillIds).to.deep.equal(['skill_gone_1', 'skill_gone_2']);
    });
  });

  it('should store at most 64 pix on a competence', function () {
    // given
    const knowledgeElements = [
      buildKnowledgeElementOf('full', 1, { earnedPix: 40 }),
      buildKnowledgeElementOf('full', 2, { earnedPix: 40 }),
    ];

    // when
    const { userCompetenceScores } = translate(knowledgeElements);

    // then
    expect(userCompetenceScores.map(({ competenceId, pix }) => [competenceId, pix])).to.deep.equal([
      ['competence_full', 64],
    ]);
  });

  it('should give nothing for a user without knowledge', function () {
    // when
    const translation = translate([]);

    // then
    expect(translation).to.deep.equal({ knowledgeStates: [], userCompetenceScores: [], unknownSkillIds: [] });
  });
});
