import { buildCorrectAnswerAndKnowledgeElement } from './build-correct-answer-and-knowledge-element.ts';

type Challenge = { id: string };
type Skill = { id: string; challenges: Challenge[] };
type Tube = { skills: Skill[] };
type Competence = { id: string; tubes: Tube[] };
type Area = { frameworkId?: string; competences: Competence[] };
type Framework = { id: string; name: string; areas: Area[] };

type PlacementAttributes = {
  userId: number;
  placementDate: Date | string;
  earnedPix: number;
};

type CompetenceIdSkillIdPair = { competenceId: string; skillId: string; challengeId: string };

const buildCorrectAnswersAndKnowledgeElementsForLearningContent = ({
  learningContent,
  userId,
  placementDate,
  earnedPix,
}: PlacementAttributes & { learningContent: Framework[] }) => {
  const competenceIdSkillIdPairs: CompetenceIdSkillIdPair[] = [];
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

buildCorrectAnswersAndKnowledgeElementsForLearningContent.fromAreas = ({
  learningContent,
  userId,
  placementDate,
  earnedPix,
}: PlacementAttributes & { learningContent: Area[] }) => {
  const areasGroupedByFramework = Map.groupBy(learningContent, (area) => area.frameworkId);
  const frameworks = [...areasGroupedByFramework].map(([frameworkId, areas]) => {
    const framework = {
      id: frameworkId || 'recDefaultFramework',
      name: frameworkId || 'DefaultFramework',
      areas,
    };
    areas.forEach((area) => (area.frameworkId = framework.id));
    return framework;
  });
  return buildCorrectAnswersAndKnowledgeElementsForLearningContent({
    learningContent: frameworks,
    userId,
    placementDate,
    earnedPix,
  });
};

export { buildCorrectAnswersAndKnowledgeElementsForLearningContent };
