/**
 * Random answer sequences played with today's code, for the tests that
 * compare the knowledge state service with it.
 *
 * Each answer is given to KnowledgeElement.createKnowledgeElementsForAnswer,
 * with the previously validated and failed skills read from the knowledge
 * elements created so far, as the use cases do. The sequences are seeded, so
 * a failing one can be replayed.
 */
import { base, Faker } from '@faker-js/faker';

import { KnowledgeElement, type KnowledgeElementStatus } from '../../../src/shared/domain/models/KnowledgeElement.js';
import { KnowledgeState } from '../../../src/shared/domain/models/KnowledgeState.ts';
import { Skill } from '../../../src/shared/domain/models/Skill.js';
import { update } from '../../../src/shared/domain/services/knowledge-state/rules.ts';

type DatedKnowledgeElement = KnowledgeElement & { createdAt: Date };

export const USER_ID = 123;

export const buildSkill = (tube: string, level: number): Skill =>
  new Skill({
    id: `skill_${tube}_${level}`,
    name: `@${tube}${level}`,
    tubeId: `tube_${tube}`,
    difficulty: level,
    competenceId: `competence_${tube}`,
    pixValue: level / 2,
  });

// Levels with gaps, as the learning content has.
export const learningContent = [
  ...[1, 2, 3, 4, 5].map((level) => buildSkill('full', level)),
  ...[1, 2, 4, 6].map((level) => buildSkill('gaps', level)),
  ...[3, 5].map((level) => buildSkill('high', level)),
];

type PlayedAnswer = {
  at: Date;
  /** What today's code created for this answer. */
  createdKnowledgeElements: KnowledgeElement[];
};

/**
 * Plays up to twelve answers on random skills of the learning content, which
 * may already be assessed. Returns what today's code created for each answer,
 * all those knowledge elements together, and the knowledge states the rules reached.
 *
 * The answers are drawn from a seeded generator, so that the same seed plays
 * the same sequence on every run and every machine: a sequence that breaks a
 * rule is named by its seed and can be replayed in a focused test, which
 * Math.random() would not allow.
 */
export const playSequence = (seed: number) => {
  const faker = new Faker({ locale: [base] });
  faker.seed(seed);
  const answerCount = faker.number.int({ min: 1, max: 12 });
  const playedAnswers: PlayedAnswer[] = [];
  const knowledgeElements: DatedKnowledgeElement[] = [];
  const knowledgeStates = new Map<string, KnowledgeState>();

  for (let index = 0; index < answerCount; index++) {
    const skill = faker.helpers.arrayElement(learningContent);
    const isOk = faker.datatype.boolean(0.6);
    const at = new Date(Date.UTC(2026, 0, 1 + index));
    const answer = { id: index, assessmentId: 1, isOk: () => isOk };

    const latest = KnowledgeElement.toLatestUniqNonResetCollection(knowledgeElements);
    const skillsWithStatus = (status: KnowledgeElementStatus) =>
      latest.reduce<Skill[]>(
        (skills, knowledgeElement) =>
          knowledgeElement.status === status
            ? [...skills, learningContent.find(({ id }) => id === knowledgeElement.skillId) as Skill]
            : skills,
        [],
      );

    const createdKnowledgeElements = KnowledgeElement.createKnowledgeElementsForAnswer({
      answer,
      challenge: { skill },
      previouslyFailedSkills: skillsWithStatus('invalidated'),
      previouslyValidatedSkills: skillsWithStatus('validated'),
      targetSkills: learningContent,
      userId: USER_ID,
    });
    knowledgeElements.push(
      ...createdKnowledgeElements.map(
        (knowledgeElement) => new KnowledgeElement({ ...knowledgeElement, createdAt: at }) as DatedKnowledgeElement,
      ),
    );

    const currentKnowledgeState =
      knowledgeStates.get(skill.tubeId) ?? new KnowledgeState({ userId: USER_ID, tubeId: skill.tubeId });

    playedAnswers.push({ at, createdKnowledgeElements });
    knowledgeStates.set(skill.tubeId, update(currentKnowledgeState, { level: skill.difficulty, isOk, at }));
  }

  return {
    playedAnswers,
    knowledgeElements,
    knowledgeStates: [...knowledgeStates.values()],
  };
};
