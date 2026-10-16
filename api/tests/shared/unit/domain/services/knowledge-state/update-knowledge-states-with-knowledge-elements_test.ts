import { expect } from 'chai';

import {
  KnowledgeElement,
  type KnowledgeElementSource,
  type KnowledgeElementStatus,
} from '../../../../../../src/shared/domain/models/KnowledgeElement.js';
import { KnowledgeState } from '../../../../../../src/shared/domain/models/KnowledgeState.ts';
import { type Skill } from '../../../../../../src/shared/domain/models/Skill.js';
import { UnknownSkillsError } from '../../../../../../src/shared/domain/services/knowledge-state/errors.ts';
import { updateKnowledgeStatesWithKnowledgeElements } from '../../../../../../src/shared/domain/services/knowledge-state/update-knowledge-states-with-knowledge-elements.ts';
import {
  buildSkill,
  learningContent,
  playSequence,
  USER_ID,
} from '../../../../../tooling/knowledge-state/answer-sequences.ts';

describe('Unit | Shared | Domain | Services | knowledge-state | update-knowledge-states-with-knowledge-elements', function () {
  const web = [1, 2, 3, 4, 5].map((level) => buildSkill('web', level));
  const mail = [1, 2, 3].map((level) => buildSkill('mail', level));
  const skills = [...web, ...mail];
  const at = new Date('2026-02-01');

  const buildKnowledgeState = (overrides = {}) =>
    new KnowledgeState({
      userId: USER_ID,
      tubeId: 'tube_web',
      floor: 2,
      ceiling: null,
      directLevels: [2],
      updatedAt: new Date('2026-01-10'),
      ...overrides,
    });

  const buildKnowledgeElement = (
    skill: Skill,
    status: KnowledgeElementStatus = 'validated',
    source: KnowledgeElementSource = 'direct',
  ): KnowledgeElement =>
    new KnowledgeElement({
      skillId: skill.id,
      competenceId: skill.competenceId,
      status,
      source,
      earnedPix: 0,
      answerId: null,
      assessmentId: null,
      userId: USER_ID,
    });

  describe('#updateKnowledgeStatesWithKnowledgeElements', function () {
    it('should create the knowledge state of a tube on its first knowledge elements', function () {
      // given
      const knowledgeElements = [buildKnowledgeElement(web[1]), buildKnowledgeElement(web[0], 'validated', 'inferred')];

      // when
      const result = updateKnowledgeStatesWithKnowledgeElements({
        userId: USER_ID,
        knowledgeStates: [],
        knowledgeElements,
        skills,
        at,
      });

      // then
      expect(result).to.deep.equal({
        knowledgeStates: [
          new KnowledgeState({ userId: USER_ID, tubeId: 'tube_web', floor: 2, directLevels: [2], updatedAt: at }),
        ],
        forgottenTubeIds: [],
      });
    });

    it('should keep a level direct when an inferred knowledge element only repeats it', function () {
      // given
      const knowledgeStates = [buildKnowledgeState()];
      const knowledgeElements = [
        buildKnowledgeElement(web[3]),
        buildKnowledgeElement(web[2], 'validated', 'inferred'),
        buildKnowledgeElement(web[1], 'validated', 'inferred'),
        buildKnowledgeElement(web[0], 'validated', 'inferred'),
      ];

      // when
      const result = updateKnowledgeStatesWithKnowledgeElements({
        userId: USER_ID,
        knowledgeStates,
        knowledgeElements,
        skills,
        at,
      });

      // then
      expect(result.knowledgeStates).to.deep.equal([
        buildKnowledgeState({ floor: 4, directLevels: [2, 4], updatedAt: at }),
      ]);
    });

    it('should let an inferred knowledge element override a direct one that said the opposite', function () {
      // given
      const knowledgeStates = [buildKnowledgeState({ floor: 0, ceiling: 2, directLevels: [2] })];
      const knowledgeElements = [
        buildKnowledgeElement(web[3]),
        buildKnowledgeElement(web[2], 'validated', 'inferred'),
        buildKnowledgeElement(web[1], 'validated', 'inferred'),
        buildKnowledgeElement(web[0], 'validated', 'inferred'),
      ];

      // when
      const result = updateKnowledgeStatesWithKnowledgeElements({
        userId: USER_ID,
        knowledgeStates,
        knowledgeElements,
        skills,
        at,
      });

      // then: the failure on level 5 is the old one, the direct failure on level 2 is overridden
      expect(result.knowledgeStates).to.deep.equal([
        buildKnowledgeState({
          floor: 4,
          ceiling: 5,
          ceilingAt: new Date('2026-01-10'),
          directLevels: [4],
          updatedAt: at,
        }),
      ]);
    });

    it('should keep the date of a ceiling that a success below it does not move', function () {
      // given
      const knowledgeStates = [buildKnowledgeState({ ceiling: 4, ceilingAt: new Date('2026-01-05') })];
      const knowledgeElements = [buildKnowledgeElement(web[2])];

      // when
      const result = updateKnowledgeStatesWithKnowledgeElements({
        userId: USER_ID,
        knowledgeStates,
        knowledgeElements,
        skills,
        at,
      });

      // then
      expect(result.knowledgeStates).to.deep.equal([
        buildKnowledgeState({
          floor: 3,
          ceiling: 4,
          ceilingAt: new Date('2026-01-05'),
          directLevels: [2, 3],
          updatedAt: at,
        }),
      ]);
    });

    it('should date the ceiling from a fresh failure above it, so that improving does not assess it again at once', function () {
      // given: the old failure on level 4 was assessed again, and the CAT asked level 5 first
      const knowledgeStates = [buildKnowledgeState({ ceiling: 4, ceilingAt: new Date('2026-01-05') })];
      const knowledgeElements = [buildKnowledgeElement(web[4], 'invalidated')];

      // when
      const result = updateKnowledgeStatesWithKnowledgeElements({
        userId: USER_ID,
        knowledgeStates,
        knowledgeElements,
        skills,
        at,
      });

      // then
      expect(result.knowledgeStates).to.deep.equal([
        buildKnowledgeState({ floor: 2, ceiling: 4, ceilingAt: at, directLevels: [2, 5], updatedAt: at }),
      ]);
    });

    it('should tighten the knowledge state of a tube with the knowledge elements of an answer', function () {
      // given
      const knowledgeStates = [buildKnowledgeState()];
      const knowledgeElements = [
        buildKnowledgeElement(web[3], 'invalidated'),
        buildKnowledgeElement(web[4], 'invalidated', 'inferred'),
      ];

      // when
      const result = updateKnowledgeStatesWithKnowledgeElements({
        userId: USER_ID,
        knowledgeStates,
        knowledgeElements,
        skills,
        at,
      });

      // then
      expect(result.knowledgeStates).to.deep.equal([
        buildKnowledgeState({ ceiling: 4, ceilingAt: at, directLevels: [2, 4], updatedAt: at }),
      ]);
    });

    describe('when an assessment improves on a failure the knowledge state already holds', function () {
      // Today's code only knows the knowledge elements of the current assessment when it answers,
      // so it creates knowledge elements for the level asked again, as for any level.
      const createdByAnsweringAgain = (isOk: boolean) =>
        KnowledgeElement.createKnowledgeElementsForAnswer({
          answer: { id: 1, assessmentId: 1, isOk: () => isOk },
          challenge: { skill: web[4] },
          previouslyFailedSkills: [],
          previouslyValidatedSkills: [],
          targetSkills: skills,
          userId: USER_ID,
        });
      const oldFailure = buildKnowledgeState({ floor: 2, ceiling: 5, ceilingAt: new Date('2025-06-01') });

      it('should lift the ceiling when the level is validated this time', function () {
        // when
        const result = updateKnowledgeStatesWithKnowledgeElements({
          userId: USER_ID,
          knowledgeStates: [oldFailure],
          knowledgeElements: createdByAnsweringAgain(true),
          skills,
          at,
        });

        // then
        expect(result.knowledgeStates).to.deep.equal([
          buildKnowledgeState({ floor: 5, ceiling: null, ceilingAt: null, directLevels: [2, 5], updatedAt: at }),
        ]);
      });

      it('should date the ceiling from today when the level is failed again', function () {
        // when
        const result = updateKnowledgeStatesWithKnowledgeElements({
          userId: USER_ID,
          knowledgeStates: [oldFailure],
          knowledgeElements: createdByAnsweringAgain(false),
          skills,
          at,
        });

        // then
        expect(result.knowledgeStates).to.deep.equal([
          buildKnowledgeState({ floor: 2, ceiling: 5, ceilingAt: at, directLevels: [2, 5], updatedAt: at }),
        ]);
      });
    });

    it('should return only the knowledge states of the impacted tubes', function () {
      // given
      const knowledgeStates = [buildKnowledgeState(), buildKnowledgeState({ tubeId: 'tube_mail' })];
      const knowledgeElements = [buildKnowledgeElement(web[2])];

      // when
      const result = updateKnowledgeStatesWithKnowledgeElements({
        userId: USER_ID,
        knowledgeStates,
        knowledgeElements,
        skills,
        at,
      });

      // then
      expect(result.knowledgeStates.map(({ tubeId, floor }) => ({ tubeId, floor }))).to.deep.equal([
        { tubeId: 'tube_web', floor: 3 },
      ]);
    });

    it('should forget a tube when everything known of it is reset', function () {
      // given
      const knowledgeStates = [buildKnowledgeState(), buildKnowledgeState({ tubeId: 'tube_mail' })];
      const knowledgeElements = [buildKnowledgeElement(web[0], 'reset'), buildKnowledgeElement(web[1], 'reset')];

      // when
      const result = updateKnowledgeStatesWithKnowledgeElements({
        userId: USER_ID,
        knowledgeStates,
        knowledgeElements,
        skills,
        at,
      });

      // then
      expect(result).to.deep.equal({ knowledgeStates: [], forgottenTubeIds: ['tube_web'] });
    });

    it('should lower the floor when the highest validated levels are reset', function () {
      // given
      const knowledgeStates = [buildKnowledgeState({ floor: 3, directLevels: [1, 3] })];
      const knowledgeElements = [buildKnowledgeElement(web[1], 'reset'), buildKnowledgeElement(web[2], 'reset')];

      // when
      const result = updateKnowledgeStatesWithKnowledgeElements({
        userId: USER_ID,
        knowledgeStates,
        knowledgeElements,
        skills,
        at,
      });

      // then
      expect(result.knowledgeStates).to.deep.equal([buildKnowledgeState({ floor: 1, directLevels: [1] })]);
    });

    it('should keep a level validated when it is reset under a level that stays validated', function () {
      // given
      const knowledgeStates = [buildKnowledgeState({ floor: 3, directLevels: [3] })];
      const knowledgeElements = [buildKnowledgeElement(web[1], 'reset')];

      // when
      const result = updateKnowledgeStatesWithKnowledgeElements({
        userId: USER_ID,
        knowledgeStates,
        knowledgeElements,
        skills,
        at,
      });

      // then
      expect(result.knowledgeStates).to.deep.equal([buildKnowledgeState({ floor: 3, directLevels: [3] })]);
    });

    it('should ignore the reset of a tube without knowledge state', function () {
      // given
      const knowledgeElements = [buildKnowledgeElement(mail[0], 'reset')];

      // when
      const result = updateKnowledgeStatesWithKnowledgeElements({
        userId: USER_ID,
        knowledgeStates: [buildKnowledgeState()],
        knowledgeElements,
        skills,
        at,
      });

      // then
      expect(result).to.deep.equal({ knowledgeStates: [], forgottenTubeIds: [] });
    });

    it('should refuse knowledge elements on skills unknown to the learning content', function () {
      // given
      const knowledgeElements = [buildKnowledgeElement(buildSkill('gone', 2))];

      // when
      const update = () =>
        updateKnowledgeStatesWithKnowledgeElements({
          userId: USER_ID,
          knowledgeStates: [],
          knowledgeElements,
          skills,
          at,
        });

      // then
      expect(update).to.throw(UnknownSkillsError, 'skill_gone_2');
    });
  });

  describe('on 500 random answer sequences', function () {
    it('should reach the same knowledge states as the rules applied answer by answer', function () {
      for (let seed = 1; seed <= 500; seed++) {
        // given
        const { playedAnswers, knowledgeStates: expectedStates } = playSequence(seed);

        // when
        const knowledgeStates = playedAnswers.reduce((currentStates, { createdKnowledgeElements, at }) => {
          const result = updateKnowledgeStatesWithKnowledgeElements({
            userId: USER_ID,
            knowledgeStates: currentStates,
            knowledgeElements: createdKnowledgeElements,
            skills: learningContent,
            at,
          });
          const replacedTubeIds = new Set(result.knowledgeStates.map(({ tubeId }) => tubeId));
          return [...currentStates.filter(({ tubeId }) => !replacedTubeIds.has(tubeId)), ...result.knowledgeStates];
        }, [] as KnowledgeState[]);

        // then
        expect(knowledgeStates, `sequence ${seed}`).to.have.deep.members(expectedStates);
      }
    });
  });
});
