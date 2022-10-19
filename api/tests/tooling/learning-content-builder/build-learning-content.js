const _ = require('lodash');
const { FRENCH_FRANCE, FRENCH_SPOKEN, ENGLISH_SPOKEN } = require('../../../lib/domain/constants').LOCALE;

const buildLearningContent = function (learningContent) {
  const allAreas = [];
  const allCompetences = [];
  const allTubes = [];
  const allSkills = [];
  const allChallenges = [];
  const allCourses = [];
  const allTutorials = [];
  const allThematics = [];
  const allTrainings = [];

  const frameworks = learningContent.map((framework) => {
    const areas = framework.areas.map((area) => {
      const competences = area.competences.map((competence) => {
        const competenceSkills = [];
        function mapTubes(pTubes) {
          if (!pTubes) return [];
          return pTubes.map((tube) => {
            const skills = tube.skills.map((skill) => {
              const tutorials =
                skill.tutorials &&
                skill.tutorials.map((tutorial) => {
                  return {
                    id: tutorial.id,
                    title: tutorial.title,
                    format: tutorial.format,
                    source: tutorial.source,
                    link: tutorial.link,
                    locale: tutorial.locale,
                    duration: tutorial.duration,
                  };
                });
              allTutorials.push(tutorials);
              const challenges =
                skill.challenges &&
                skill.challenges.map((challenge) => {
                  return {
                    id: challenge.id,
                    competenceId: competence.id,
                    skillId: skill.id,
                    status: challenge.statut || 'validé',
                    solution: challenge.solution,
                    solutionToDisplay: challenge.solutionToDisplay,
                    locales: _convertLanguesToLocales(challenge.langues || ['Francophone']),
                    type: challenge.type,
                    focusable: challenge.focusable,
                    instruction: challenge.instruction,
                    alternativeInstruction: challenge.alternativeInstruction,
                    proposals: challenge.proposals,
                    autoReply: challenge.autoReply,
                    alpha: challenge.alpha,
                    delta: challenge.delta,
                    timer: challenge.timer,
                    illustrationUrl: challenge.illustrationUrl,
                    illustrationAlt: challenge.illustrationAlt,
                    attachments: challenge.attachments,
                    embedUrl: challenge.embedUrl,
                    embedTitle: challenge.embedTitle,
                    embedHeight: challenge.embedHeight,
                    format: challenge.format,
                    responsive: challenge.responsive,
                    genealogy: challenge.genealogy,
                  };
                });
              allChallenges.push(challenges);
              return {
                id: skill.id,
                tubeId: tube.id,
                status: skill.status || 'actif',
                competenceId: competence.id,
                name: skill.name,
                pixValue: skill.pixValue,
                tutorialIds: skill.tutorials && _.map(skill.tutorials, 'id'),
                version: skill.version,
                level: skill.level,
                hintStatus: skill.hintStatus,
                hintFrFr: skill.hintFr,
                hintEnUs: skill.hintEn,
              };
            });
            competenceSkills.push(skills);
            allSkills.push(skills);
            return {
              id: tube.id,
              name: tube.name,
              description: tube.description,
              title: tube.title,
              practicalTitleFrFr: tube.practicalTitleFr || tube.practicalTitle,
              practicalDescriptionFrFr: tube.practicalDescriptionFr || tube.practicalDescription,
              practicalTitleEnUs: tube.practicalTitleEn || tube.practicalTitle,
              practicalDescriptionEnUs: tube.practicalDescriptionEn || tube.practicalDescription,
              competenceId: competence.id,
            };
          });
        }
        const tubes = mapTubes(competence.tubes);
        allTubes.push(tubes);
        const thematics =
          competence.thematics?.map((thematic) => {
            const tubes = mapTubes(thematic.tubes);
            allTubes.push(tubes);
            return {
              id: thematic.id,
              name: thematic.nameFr || thematic.name,
              nameEnUs: thematic.nameEn || thematic.name,
              index: thematic.index,
              tubeIds: tubes.map((tube) => tube.id),
              competenceId: competence.id,
            };
          }) ?? [];
        allThematics.push(thematics);
        return {
          id: competence.id,
          skillIds: competenceSkills.flat().map((skill) => skill.id),
          areaId: area.id,
          origin: competence.origin || 'Pix',
          index: competence.index,
          nameFrFr: competence.nameFr || competence.name,
          nameEnUs: competence.nameEn || competence.name,
          descriptionFrFr: competence.descriptionFr || competence.description,
          descriptionEnUs: competence.descriptionEn || competence.description,
          thematicIds: thematics.map(({ id }) => id),
        };
      });
      allCompetences.push(competences);
      const courses =
        area.courses &&
        area.courses.map((course) => {
          return {
            id: course.id,
            challenges: course.challengeIds,
            name: course.name,
            description: course.description,
          };
        });
      allCourses.push(courses);
      allTrainings.push(area.trainings);
      area.frameworkId = framework.id;
      return {
        id: area.id,
        code: area.code,
        name: area.name,
        titleFrFr: area.titleFr,
        titleEnUs: area.titleEn,
        color: area.color,
        frameworkId: framework.id,
        competenceIds: competences.map((competence) => competence.id),
      };
    });
    allAreas.push(areas);
    return {
      id: framework.id,
      name: framework.name,
      areaIds: areas.map((area) => area.id),
    };
  });
  return {
    areas: allAreas.flat(),
    competences: allCompetences.flat(),
    tubes: allTubes.flat(),
    skills: allSkills.flat(),
    challenges: _.compact(allChallenges.flat()),
    courses: _.compact(allCourses.flat()),
    tutorials: _.compact(allTutorials.flat()),
    thematics: allThematics.flat(),
    trainings: allTrainings.flat(),
    frameworks,
  };
};

function _convertLanguesToLocales(langues) {
  return langues.map((langue) => {
    if (langue === 'Francophone') {
      return FRENCH_SPOKEN;
    }
    if (langue === 'Franco Français') {
      return FRENCH_FRANCE;
    }
    if (langue === 'Anglais') {
      return ENGLISH_SPOKEN;
    }
  });
}

buildLearningContent.fromAreas = function (learningContent) {
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
  return buildLearningContent(frameworks);
};

module.exports = buildLearningContent;
