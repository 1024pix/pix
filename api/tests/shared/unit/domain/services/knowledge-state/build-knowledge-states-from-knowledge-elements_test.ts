import { expect } from 'chai';

import {
  KnowledgeElement,
  type KnowledgeElementSource,
  type KnowledgeElementStatus,
} from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { KnowledgeState } from '../../../../../../src/shared/domain/models/KnowledgeState.ts';
import { type Skill } from '../../../../../../src/shared/domain/models/Skill.js';
import { buildKnowledgeStatesFromKnowledgeElements } from '../../../../../../src/shared/domain/services/knowledge-state/build-knowledge-states-from-knowledge-elements.ts';
import { UnknownSkillsError } from '../../../../../../src/shared/domain/services/knowledge-state/errors.ts';
import {
  buildSkill,
  learningContent,
  playSequence,
  USER_ID,
} from '../../../../../tooling/knowledge-state/answer-sequences.ts';

const buildKnowledgeElement = ({
  skill,
  status = 'validated',
  source = 'direct',
  createdAt = new Date('2026-01-10'),
}: {
  skill: Skill;
  status?: KnowledgeElementStatus;
  source?: KnowledgeElementSource;
  createdAt?: Date;
}): KnowledgeElement =>
  new KnowledgeElement({
    skillId: skill.id,
    competenceId: skill.competenceId,
    status,
    source,
    createdAt,
    earnedPix: 0,
    answerId: null,
    assessmentId: null,
    userId: USER_ID,
  });

describe('Unit | Shared | Domain | Services | knowledge-state | build-knowledge-states-from-knowledge-elements', function () {
  const web = [1, 2, 3, 4, 5].map((level) => buildSkill('web', level));
  const mail = [1, 2, 3].map((level) => buildSkill('mail', level));
  const skills = [...web, ...mail];

  describe('#buildKnowledgeStatesFromKnowledgeElements', function () {
    it('should describe a tube by its bounds, its direct levels and its last move', function () {
      // given
      const knowledgeElements = [
        buildKnowledgeElement({ skill: web[0], source: 'inferred', createdAt: new Date('2026-01-10') }),
        buildKnowledgeElement({ skill: web[1], createdAt: new Date('2026-01-10') }),
        buildKnowledgeElement({ skill: web[3], status: 'invalidated', createdAt: new Date('2026-01-12') }),
        buildKnowledgeElement({
          skill: web[4],
          status: 'invalidated',
          source: 'inferred',
          createdAt: new Date('2026-01-12'),
        }),
      ];

      // when
      const knowledgeStates = buildKnowledgeStatesFromKnowledgeElements({ userId: USER_ID, knowledgeElements, skills });

      // then
      expect(knowledgeStates).to.deep.equal([
        new KnowledgeState({
          userId: USER_ID,
          tubeId: 'tube_web',
          floor: 2,
          ceiling: 4,
          ceilingAt: new Date('2026-01-12'),
          directLevels: [2, 4],
          updatedAt: new Date('2026-01-12'),
        }),
      ]);
    });

    it('should date the ceiling from the failure that set it, not from the last move of the tube', function () {
      // given
      const knowledgeElements = [
        buildKnowledgeElement({ skill: web[3], status: 'invalidated', createdAt: new Date('2026-01-12') }),
        buildKnowledgeElement({ skill: web[1], createdAt: new Date('2026-01-20') }),
      ];

      // when
      const [knowledgeState] = buildKnowledgeStatesFromKnowledgeElements({
        userId: USER_ID,
        knowledgeElements,
        skills,
      });

      // then
      expect(knowledgeState).to.deep.include({
        ceiling: 4,
        ceilingAt: new Date('2026-01-12'),
        updatedAt: new Date('2026-01-20'),
      });
    });

    it('should date the ceiling from the latest failure of the tube, even above the ceiling level', function () {
      // given
      const knowledgeElements = [
        buildKnowledgeElement({ skill: web[2], status: 'invalidated', createdAt: new Date('2026-01-12') }),
        buildKnowledgeElement({ skill: web[4], status: 'invalidated', createdAt: new Date('2026-01-20') }),
      ];

      // when
      const [knowledgeState] = buildKnowledgeStatesFromKnowledgeElements({
        userId: USER_ID,
        knowledgeElements,
        skills,
      });

      // then
      expect(knowledgeState).to.deep.include({ ceiling: 3, ceilingAt: new Date('2026-01-20') });
    });

    it('should ignore the date of a failure under the floor, overridden by a validation', function () {
      // given
      const knowledgeElements = [
        buildKnowledgeElement({ skill: web[1], status: 'invalidated', createdAt: new Date('2026-01-20') }),
        buildKnowledgeElement({ skill: web[2], createdAt: new Date('2026-01-25') }),
        buildKnowledgeElement({ skill: web[4], status: 'invalidated', createdAt: new Date('2026-01-12') }),
      ];

      // when
      const [knowledgeState] = buildKnowledgeStatesFromKnowledgeElements({
        userId: USER_ID,
        knowledgeElements,
        skills,
      });

      // then
      expect(knowledgeState).to.deep.include({ floor: 3, ceiling: 5, ceilingAt: new Date('2026-01-12') });
    });

    it('should date the ceiling from the latest failure when several skills share its level', function () {
      // given
      const otherVersionOfWeb4 = buildSkill('web', 4);
      otherVersionOfWeb4.id = 'skill_web_4_v2';
      const knowledgeElements = [
        buildKnowledgeElement({ skill: web[3], status: 'invalidated', createdAt: new Date('2026-01-12') }),
        buildKnowledgeElement({ skill: otherVersionOfWeb4, status: 'invalidated', createdAt: new Date('2026-01-15') }),
      ];

      // when
      const [knowledgeState] = buildKnowledgeStatesFromKnowledgeElements({
        userId: USER_ID,
        knowledgeElements,
        skills: [...skills, otherVersionOfWeb4],
      });

      // then
      expect(knowledgeState).to.deep.include({ ceiling: 4, ceilingAt: new Date('2026-01-15') });
    });

    it('should keep the most recent knowledge element of a skill', function () {
      // given
      const knowledgeElements = [
        buildKnowledgeElement({ skill: web[2], status: 'invalidated', createdAt: new Date('2026-01-10') }),
        buildKnowledgeElement({ skill: web[2], status: 'validated', createdAt: new Date('2026-02-01') }),
      ];

      // when
      const [knowledgeState] = buildKnowledgeStatesFromKnowledgeElements({
        userId: USER_ID,
        knowledgeElements,
        skills,
      });

      // then
      expect(knowledgeState).to.deep.include({ floor: 3, ceiling: null, updatedAt: new Date('2026-02-01') });
    });

    it('should give no knowledge state to a tube whose knowledge was reset', function () {
      // given
      const knowledgeElements = [
        buildKnowledgeElement({ skill: web[1], createdAt: new Date('2026-01-10') }),
        buildKnowledgeElement({ skill: web[1], status: 'reset', createdAt: new Date('2026-02-01') }),
        buildKnowledgeElement({ skill: mail[0], createdAt: new Date('2026-01-10') }),
      ];

      // when
      const knowledgeStates = buildKnowledgeStatesFromKnowledgeElements({ userId: USER_ID, knowledgeElements, skills });

      // then
      expect(knowledgeStates.map(({ tubeId }) => tubeId)).to.deep.equal(['tube_mail']);
    });

    it('should let the validation win when historical knowledge contradicts itself on a tube', function () {
      // given
      const knowledgeElements = [
        buildKnowledgeElement({ skill: web[2], status: 'invalidated' }),
        buildKnowledgeElement({ skill: web[3], status: 'validated' }),
      ];

      // when
      const [knowledgeState] = buildKnowledgeStatesFromKnowledgeElements({
        userId: USER_ID,
        knowledgeElements,
        skills,
      });

      // then
      expect(knowledgeState).to.deep.include({ floor: 4, ceiling: null });
    });

    it('should not keep as direct a failed level that a higher validation overrides', function () {
      // given
      const knowledgeElements = [
        buildKnowledgeElement({ skill: web[2], status: 'invalidated', source: 'direct' }),
        buildKnowledgeElement({ skill: web[3], status: 'validated', source: 'direct' }),
      ];

      // when
      const [knowledgeState] = buildKnowledgeStatesFromKnowledgeElements({
        userId: USER_ID,
        knowledgeElements,
        skills,
      });

      // then
      expect(knowledgeState.directLevels).to.deep.equal([4]);
    });

    it('should keep the failures above the floor when a lower failure is overridden', function () {
      // given
      const knowledgeElements = [
        buildKnowledgeElement({ skill: web[1], status: 'invalidated', source: 'direct' }),
        buildKnowledgeElement({ skill: web[2], status: 'validated', source: 'direct' }),
        buildKnowledgeElement({ skill: web[4], status: 'invalidated', source: 'direct' }),
      ];

      // when
      const [knowledgeState] = buildKnowledgeStatesFromKnowledgeElements({
        userId: USER_ID,
        knowledgeElements,
        skills,
      });

      // then
      expect(knowledgeState).to.deep.include({ floor: 3, ceiling: 5, directLevels: [3, 5] });
    });

    it('should give one knowledge state per tube', function () {
      // given
      const knowledgeElements = [
        buildKnowledgeElement({ skill: web[0] }),
        buildKnowledgeElement({ skill: mail[1] }),
        buildKnowledgeElement({ skill: mail[0], source: 'inferred' }),
      ];

      // when
      const knowledgeStates = buildKnowledgeStatesFromKnowledgeElements({ userId: USER_ID, knowledgeElements, skills });

      // then
      expect(knowledgeStates.map(({ tubeId, floor }) => ({ tubeId, floor }))).to.have.deep.members([
        { tubeId: 'tube_mail', floor: 2 },
        { tubeId: 'tube_web', floor: 1 },
      ]);
    });

    it('should refuse knowledge elements on skills unknown to the learning content', function () {
      // given
      const knowledgeElements = [
        buildKnowledgeElement({ skill: web[0] }),
        buildKnowledgeElement({ skill: buildSkill('gone', 2) }),
      ];

      // when
      const build = () => buildKnowledgeStatesFromKnowledgeElements({ userId: USER_ID, knowledgeElements, skills });

      // then
      expect(build).to.throw(UnknownSkillsError, 'skill_gone_2');
    });
  });

  describe('on 500 random answer sequences', function () {
    it('should reach the same knowledge states as the rules applied answer by answer', function () {
      for (let seed = 1; seed <= 500; seed++) {
        // given
        const { knowledgeElements, knowledgeStates } = playSequence(seed);

        // when
        const built = buildKnowledgeStatesFromKnowledgeElements({
          userId: USER_ID,
          knowledgeElements,
          skills: learningContent,
        });

        // then
        expect(built, `sequence ${seed}`).to.have.deep.members(knowledgeStates);
      }
    });
  });
});
