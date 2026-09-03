import { seedsConfig } from '../../../../config/seeds-config.js';
import { lcmsClient } from '../../../../src/shared/infrastructure/lcms-client.js';
import { logger, SCOPES } from '../../../../src/shared/infrastructure/utils/logger.js';

export async function learningContentBuilder({ databaseBuilder }) {
  const learningContent = await lcmsClient.getRelease();

  const totalCounts = Object.entries(learningContent).map(([model, entities]) => [model, entities.length]);

  learningContent.frameworks = learningContent.frameworks.filter((framework) =>
    seedsConfig.learningContent.frameworks.includes(framework.name),
  );

  learningContent.areas = learningContent.areas.filter(belongsToOneOfFrameworks(learningContent.frameworks));

  learningContent.competences = learningContent.competences.filter(belongsToOneOfAreas(learningContent.areas));

  learningContent.thematics = learningContent.thematics.filter(belongsToOneOfCompetences(learningContent.competences));

  learningContent.tubes = learningContent.tubes.filter(belongsToOneOfThematics(learningContent.thematics));

  learningContent.skills = learningContent.skills
    .filter(belongsToOneOfTubes(learningContent.tubes))
    .filter(isActiveOrArchived);

  learningContent.challenges = learningContent.challenges
    .filter(belongsToOneOfSkills(learningContent.skills))
    .filter(isValidatedOrArchived)
    .filter(hasOneOfLocales(seedsConfig.learningContent.locales))
    .filter(keepingPrototypeAndOneAlternativeBySkillAndLocale());

  learningContent.tutorials = learningContent.tutorials.filter(isUsedByOneOf(learningContent.skills));

  learningContent.courses = learningContent.courses.filter(hasChallengesAvailable(learningContent.challenges));

  learningContent.missions = learningContent.missions.filter(belongsToOneOfCompetences(learningContent.competences));

  totalCounts.forEach(([model, totalCount]) => {
    logger.debug(
      { event: SCOPES.LEARNING_CONTENT },
      `inserting ${learningContent[model].length} ${model} out of ${totalCount}`,
    );
  });

  databaseBuilder.factory.learningContent.build(learningContent, { noDefaultValues: true });
  await databaseBuilder.commit();
}

function belongsToOneOfFrameworks(frameworks) {
  const frameworkIds = new Set(frameworks.map((framework) => framework.id));
  return (area) => frameworkIds.has(area.frameworkId);
}

function belongsToOneOfAreas(areas) {
  const areaIds = new Set(areas.map((area) => area.id));
  return (competence) => areaIds.has(competence.areaId);
}

function belongsToOneOfCompetences(competences) {
  const competenceIds = new Set(competences.map((competence) => competence.id));
  return (thematicOrMission) => competenceIds.has(thematicOrMission.competenceId);
}

function belongsToOneOfThematics(thematics) {
  const thematicIds = new Set(thematics.map((thematic) => thematic.id));
  return (tube) => thematicIds.has(tube.thematicId);
}

function belongsToOneOfTubes(tubes) {
  const tubeIds = new Set(tubes.map((tube) => tube.id));
  return (skill) => tubeIds.has(skill.tubeId);
}

function isActiveOrArchived(skill) {
  return ['actif', 'archivé'].includes(skill.status);
}

function belongsToOneOfSkills(skills) {
  const skillIds = new Set(skills.map((skill) => skill.id));
  return (challenge) => skillIds.has(challenge.skillId);
}

function isValidatedOrArchived(challenge) {
  return ['validé', 'archivé'].includes(challenge.status);
}

function hasOneOfLocales(locales) {
  const localesSet = new Set(locales);
  return (challenge) => challenge.locales.some((locale) => localesSet.has(locale));
}

function keepingPrototypeAndOneAlternativeBySkillAndLocale() {
  const alternativesCountBySkillAndLocale = new Map();

  return (challenge) => {
    if (challenge.genealogy === 'Prototype 1') return true;

    const alternativeKey = `${challenge.skillId}:${challenge.locales[0]}`;
    if (alternativesCountBySkillAndLocale.get(alternativeKey) ?? 0 >= 1) {
      return false;
    }
    alternativesCountBySkillAndLocale.set(alternativeKey, alternativesCountBySkillAndLocale.get(alternativeKey) + 1);
    return true;
  };
}

function isUsedByOneOf(skills) {
  const tutorialIds = new Set(skills.flatMap((skill) => [...skill.tutorialIds, skill.learningMoreTutorialIds]));
  return (tutorial) => tutorialIds.has(tutorial.id);
}

function hasChallengesAvailable(challenges) {
  const challengeIds = new Set(challenges.map((challenge) => challenge.id));
  return (course) => course.challenges.every((challengeId) => challengeIds.has(challengeId));
}
