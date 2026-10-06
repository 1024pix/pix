import { expect } from 'chai';

import { KnowledgeElement } from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { KnowledgeState } from '../../../../../../src/shared/domain/models/KnowledgeState.ts';
import { buildKnowledgeElementsFromKnowledgeStates } from '../../../../../../src/shared/domain/services/knowledge-state/build-knowledge-elements-from-knowledge-states.ts';
import { buildKnowledgeStatesFromKnowledgeElements } from '../../../../../../src/shared/domain/services/knowledge-state/build-knowledge-states-from-knowledge-elements.ts';
import {
  buildSkill,
  learningContent,
  playSequence,
  USER_ID,
} from '../../../../../tooling/knowledge-state/answer-sequences.ts';

describe('Unit | Shared | Domain | Services | knowledge-state | build-knowledge-elements-from-knowledge-states', function () {
  const web = [1, 2, 3, 4, 5].map((level) => buildSkill('web', level));
  const mail = [1, 2, 3].map((level) => buildSkill('mail', level));
  const skills = [...web, ...mail];

  const buildKnowledgeState = (overrides = {}) =>
    new KnowledgeState({
      userId: USER_ID,
      tubeId: 'tube_web',
      floor: 2,
      ceiling: 4,
      directLevels: [2, 4],
      updatedAt: new Date('2026-01-12'),
      ...overrides,
    });

  describe('#buildKnowledgeElementsFromKnowledgeStates', function () {
    it('should give one knowledge element per assessed skill of the tube', function () {
      // given
      const knowledgeStates = [buildKnowledgeState()];

      // when
      const knowledgeElements = buildKnowledgeElementsFromKnowledgeStates({ knowledgeStates, skills });

      // then
      expect(knowledgeElements.map(({ skillId, status, source }) => ({ skillId, status, source }))).to.deep.equal([
        { skillId: 'skill_web_1', status: 'validated', source: 'inferred' },
        { skillId: 'skill_web_2', status: 'validated', source: 'direct' },
        { skillId: 'skill_web_4', status: 'invalidated', source: 'direct' },
        { skillId: 'skill_web_5', status: 'invalidated', source: 'inferred' },
      ]);
    });

    it('should earn the current pix value of a validated skill, and nothing for an invalidated one', function () {
      // given
      const knowledgeStates = [buildKnowledgeState()];

      // when
      const knowledgeElements = buildKnowledgeElementsFromKnowledgeStates({ knowledgeStates, skills });

      // then
      expect(knowledgeElements.map(({ earnedPix }) => earnedPix)).to.deep.equal([0.5, 1, 0, 0]);
    });

    it('should date every knowledge element of a tube from its last move, with no answer nor assessment', function () {
      // given
      const knowledgeStates = [buildKnowledgeState({ floor: 1, ceiling: null, directLevels: [1] })];

      // when
      const knowledgeElements = buildKnowledgeElementsFromKnowledgeStates({ knowledgeStates, skills });

      // then
      expect({ ...knowledgeElements[0] }).to.deep.equal({
        id: null,
        createdAt: new Date('2026-01-12'),
        source: 'direct',
        status: 'validated',
        earnedPix: 0.5,
        answerId: null,
        assessmentId: null,
        skillId: 'skill_web_1',
        userId: USER_ID,
        competenceId: 'competence_web',
      });
    });

    it('should give nothing for a tube without knowledge state, nor for a knowledge state without skill', function () {
      // given
      const knowledgeStates = [buildKnowledgeState({ tubeId: 'tube_gone' })];

      // when
      const knowledgeElements = buildKnowledgeElementsFromKnowledgeStates({ knowledgeStates, skills });

      // then
      expect(knowledgeElements).to.deep.equal([]);
    });

    it('should build the knowledge elements of several users at once', function () {
      // given
      const knowledgeStates = [
        buildKnowledgeState({ userId: 1, floor: 1, ceiling: null }),
        buildKnowledgeState({ userId: 2, tubeId: 'tube_mail', floor: 0, ceiling: 3 }),
      ];

      // when
      const knowledgeElements = buildKnowledgeElementsFromKnowledgeStates({ knowledgeStates, skills });

      // then
      expect(knowledgeElements.map(({ userId, skillId }) => ({ userId, skillId }))).to.deep.equal([
        { userId: 1, skillId: 'skill_web_1' },
        { userId: 2, skillId: 'skill_mail_3' },
      ]);
    });
  });

  describe('on 500 random answer sequences', function () {
    // What a knowledge state keeps of a knowledge element: not its date, answer nor assessment.
    const comparable = ({ skillId, status, source, earnedPix, userId, competenceId }: KnowledgeElement) => ({
      skillId,
      status,
      source,
      earnedPix,
      userId,
      competenceId,
    });

    it('should give back the latest knowledge elements created by actual code', function () {
      for (let seed = 1; seed <= 500; seed++) {
        // given
        const { knowledgeElements } = playSequence(seed);
        const knowledgeStates = buildKnowledgeStatesFromKnowledgeElements({
          userId: USER_ID,
          knowledgeElements,
          skills: learningContent,
        });

        // when
        const builtKnowledgeElements = buildKnowledgeElementsFromKnowledgeStates({
          knowledgeStates,
          skills: learningContent,
        });

        // then
        const latest = KnowledgeElement.toLatestUniqNonResetCollection(knowledgeElements);
        expect(builtKnowledgeElements.map(comparable), `sequence ${seed}`).to.have.deep.members(latest.map(comparable));
      }
    });

    it('should give back the same knowledge states when built again from its knowledge elements', function () {
      for (let seed = 1; seed <= 500; seed++) {
        // given
        const { knowledgeStates } = playSequence(seed);

        // when
        const builtKnowledgeElements = buildKnowledgeElementsFromKnowledgeStates({
          knowledgeStates,
          skills: learningContent,
        });
        const built = buildKnowledgeStatesFromKnowledgeElements({
          userId: USER_ID,
          knowledgeElements: builtKnowledgeElements,
          skills: learningContent,
        });

        // then
        expect(built, `sequence ${seed}`).to.have.deep.members(knowledgeStates);
      }
    });
  });
});
