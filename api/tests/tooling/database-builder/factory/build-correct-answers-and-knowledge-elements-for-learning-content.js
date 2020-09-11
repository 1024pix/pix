const buildCorrectAnswerAndKnowledgeElement = require('./build-correct-answer-and-knowledge-element');

const buildCorrectAnswersAndKnowledgeElementsForLearningContent = function(
  {
    learningContent,
    userId,
    placementDate,
    earnedPix,
  }) {
  const competenceIdSkillIdPairs = [];
  learningContent.forEach((area) => {
    area.competences.forEach((competence) => {
      competence.tubes.forEach((tube) => {
        tube.skills.forEach((skill) => {
          competenceIdSkillIdPairs.push({ competenceId: competence.id, skillId: skill.id });
          skill.challenges.forEach((challenge) => {
            buildCorrectAnswerAndKnowledgeElement(
              {
                userId,
                competenceId: competence.id,
                skillId: skill.id,
                challengeId: challenge.id,
                pixValue: earnedPix,
                acquisitionDate: placementDate,
              },
            );
          });
        });
      });
    });
  });
  return competenceIdSkillIdPairs;
};

module.exports = buildCorrectAnswersAndKnowledgeElementsForLearningContent;

