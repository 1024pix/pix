import { UserEligibilityCalculator } from '../models/UserEligibilityCalculator.js';

async function getUserEligibilityList({
  userId,
  limitDate = new Date(),
  knowledgeElementRepository,
  competenceRepository,
}) {
  const userEligibilityCalculator = new UserEligibilityCalculator({ userId, date: limitDate });
  const allKnowledgeElements = await knowledgeElementRepository.findUniqByUserId({
    userId: userId,
    limitDate,
  });
  const coreCompetences = await competenceRepository.listPixCompetencesOnly();
  userEligibilityCalculator.computeCoreEligibility({ allKnowledgeElements, coreCompetences });
  return userEligibilityCalculator.buildUserEligibilityList();
}

export { getUserEligibilityList };
