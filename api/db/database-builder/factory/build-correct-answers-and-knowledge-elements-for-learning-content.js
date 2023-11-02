import { buildCorrectAnswerAndKnowledgeElement } from './build-correct-answer-and-knowledge-element.js';
import _ from 'lodash';

const buildCorrectAnswersAndKnowledgeElementsForLearningContent = function ({
  learningContent,
  userId,
  placementDate,
  earnedPix,
}) {
  const competenceIdSkillIdPairs = [];
  learningContent.forEach((framework) => {
    framework.areas.forEach((area) => {
      area.competences.forEach((competence) => {
        competence.tubes.forEach((tube) => {
          tube.skills.forEach((skill) => {
            competenceIdSkillIdPairs.push({
              competenceId: competence.id,
              skillId: skill.id,
              challengeId: skill.challenges[0].id,
            });
            skill.challenges.forEach((challenge) => {
              buildCorrectAnswerAndKnowledgeElement({
                userId,
                competenceId: competence.id,
                skillId: skill.id,
                challengeId: challenge.id,
                pixValue: earnedPix,
                acquisitionDate: placementDate,
              });
            });
          });
        });
      });
    });
  });
  return competenceIdSkillIdPairs;
};

buildCorrectAnswersAndKnowledgeElementsForLearningContent.fromAreas = function ({
  learningContent,
  userId,
  placementDate,
  earnedPix,
}) {
  const areasGroupedByFramework = _.groupBy(learningContent, 'frameworkId');
  const frameworks = [];
  for (const [frameworkId, areas] of Object.entries(areasGroupedByFramework)) {
    const framework = {
      id: frameworkId || 'recDefaultFramework',
      name: frameworkId || 'DefaultFramework',
      areas: areas,
    };
    frameworks.push(framework);
    areas.forEach((area) => (area.frameworkId = framework.id));
  }
  return buildCorrectAnswersAndKnowledgeElementsForLearningContent({
    learningContent: frameworks,
    userId,
    placementDate,
    earnedPix,
  });
};

export { buildCorrectAnswersAndKnowledgeElementsForLearningContent };
