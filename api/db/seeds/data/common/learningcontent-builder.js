import { lcmsClient } from '../../../../src/shared/infrastructure/lcms-client.js';
import { logger } from '../../../../src/shared/infrastructure/utils/logger.js';

const MAX_SKILL_ALTERNATIVES_COUNT = 1;
const SKILL_STATUSES = ['actif', 'archivé'];
const CHALLENGE_STATUSES = ['validé', 'archivé'];
const GENEALOGY_PROTOTYPE = 'Prototype 1';

export async function learningContentBuilder({ databaseBuilder }) {
  const learningContent = await lcmsClient.getLatestRelease();

  const totalSkillsCount = learningContent.skills.length;
  const totalChallengesCount = learningContent.challenges.length;
  const totalTutorialsCount = learningContent.tutorials.length;

  learningContent.skills = learningContent.skills.filter((skill) => SKILL_STATUSES.includes(skill.status));

  const skillIds = new Set(learningContent.skills.map((skill) => skill.id));
  const skillAlternativesCount = new Map();

  learningContent.challenges = learningContent.challenges.filter((challenge) => {
    const { skillId } = challenge;
    if (!skillIds.has(skillId)) return false;
    if (!CHALLENGE_STATUSES.includes(challenge.status)) return false;
    if (challenge.genealogy === GENEALOGY_PROTOTYPE) return true;
    const alternativeKey = `${skillId}:${challenge.locales[0]}`;
    if (skillAlternativesCount.get(alternativeKey) ?? 0 >= MAX_SKILL_ALTERNATIVES_COUNT) return false;
    skillAlternativesCount.set(alternativeKey, skillAlternativesCount.get(alternativeKey) + 1);
    return true;
  });

  const tutorialIds = new Set(
    learningContent.skills.flatMap((skill) => [...skill.tutorialIds, skill.learningMoreTutorialIds]),
  );

  learningContent.tutorials = learningContent.tutorials.filter((tutorial) => tutorialIds.has(tutorial.id));

  logger.debug(`inserting ${learningContent.skills.length} skills out of ${totalSkillsCount}`);
  logger.debug(`inserting ${learningContent.challenges.length} challenges out of ${totalChallengesCount}`);
  logger.debug(`inserting ${learningContent.tutorials.length} tutorials out of ${totalTutorialsCount}`);

  databaseBuilder.factory.learningContent.build(learningContent);
  await databaseBuilder.commit();
}
