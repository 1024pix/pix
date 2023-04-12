const _ = require('lodash');
const { FRENCH_FRANCE, FRENCH_SPOKEN, ENGLISH_SPOKEN } = require('../../../lib/domain/constants').LOCALE;

/**
 * @typedef {Object} I18nObject
 * @property {string} [fr]
 * @property {string} [en]
 */

/**
 * @typedef {FrameworkTree[]} LearningContentTree
 */

/**
 * @typedef {Object} FrameworkTree
 * @property {string} [id]
 * @property {string} [name]
 * @property {AreaTree[]} areas
 */

/**
 * @typedef {Object} AreaTree
 * @property {string} id
 * @property {string} [frameworkId]
 * @property {string} [code]
 * @property {string} [name]
 * @property {I18nObject} [title_i18n]
 * @property {string} [color]
 * @property {Object[]} [courses]
 * @property {CompetenceTree[]} [competences]
 * @property {Object[]} [trainings]
 */

/**
 * @typedef {Object} CompetenceTree
 * @property {string} id
 * @property {string} [origin='Pix']
 * @property {string} [index]
 * @property {I18nObject} [name_i18n]
 * @property {I18nObject} [description_i18n]
 * @property {TubeTree[]} [tubes]
 * @property {ThematicTree[]} [thematics]
 */

/**
 * @typedef {Object} ThematicTree
 * @property {string} id
 * @property {I18nObject} [name_i18n]
 * @property {string} [index]
 * @property {TubeTree[]} [tubes]
 */

/**
 * @typedef {Object} TubeTree
 * @property {string} id
 * @property {string} [name]
 * @property {string} [description]
 * @property {string} [title]
 * @property {I18nObject} [practicalTitle_i18n]
 * @property {I18nObject} [practicalDescription_i18n]
 * @property {boolean} [isMobileCompliant]
 * @property {boolean} [isTabletCompliant]
 * @property {SkillTree[]} [skills]
 */

/**
 * @typedef {Object} SkillTree
 * @property {string} id
 * @property {string} [status='actif']
 * @property {string} [competenceId]
 * @property {string} [name]
 * @property {string} [nom] @deprecated
 * @property {number} [pixValue]
 * @property {string} [version]
 * @property {number} [level]
 * @property {Challenge[]} [challenges]
 * @property {Tutorial[]} [tutorials]
 */

/**
 * @typedef {Object} Challenge
 * @property {string} id
 * @property {string} [competenceId]
 * @property {string} [skillId]
 * @property {string} [statut='validé']
 * @property {string} [solution]
 * @property {string[]} [locales=['Francophone']]
 * @property {string} [type]
 * @property {string} [focusable]
 * @property {string} [instruction]
 * @property {string[]} [proposals]
 * @property {string} [autoReply]
 * @property {number} [alpha]
 * @property {number} [delta]
 */

/**
 * @typedef {Object} Tutorial
 * @property {string} id
 * @property {string} [title]
 * @property {string} [format]
 * @property {string} [source]
 * @property {string} [link]
 * @property {string} [locale]
 * @property {string} [duration]
 */

/**
 * @param {LearningContentTree} learningContent
 * @returns
 */
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
      const competences = area.competences?.map((competence) => {
        const competenceSkills = [];
        function mapTubes(pTubes, thematicId) {
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
                    locales: _convertLanguesToLocales(challenge.langues || ['Francophone']),
                    type: challenge.type,
                    focusable: challenge.focusable,
                    instruction: challenge.instruction,
                    proposals: challenge.proposals,
                    autoReply: challenge.autoReply,
                    alpha: challenge.alpha,
                    delta: challenge.delta,
                  };
                });
              allChallenges.push(challenges);
              return {
                id: skill.id,
                tubeId: tube.id,
                status: skill.status || 'actif',
                competenceId: competence.id,
                name: skill.name ?? skill.nom, // FIXME delete usages of nom
                pixValue: skill.pixValue,
                tutorialIds: skill.tutorials && _.map(skill.tutorials, 'id'),
                version: skill.version,
                level: skill.level,
              };
            });
            competenceSkills.push(skills);
            allSkills.push(skills);
            return {
              id: tube.id,
              name: tube.name,
              description: tube.description,
              title: tube.title,
              practicalTitle_i18n: tube.practicalTitle_i18n,
              practicalDescription_i18n: tube.practicalDescription_i18n,
              isMobileCompliant: tube.isMobileCompliant,
              isTabletCompliant: tube.isTabletCompliant,
              competenceId: competence.id,
              thematicId,
              skillIds: skills.map((skill) => skill.id),
            };
          });
        }
        const tubes = mapTubes(competence.tubes);
        allTubes.push(tubes);
        const thematics =
          competence.thematics?.map((thematic) => {
            const tubes = mapTubes(thematic.tubes, thematic.id);
            allTubes.push(tubes);
            return {
              id: thematic.id,
              name_i18n: thematic.name_i18n,
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
          name_i18n: competence.name_i18n,
          description_i18n: competence.description_i18n,
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
        title_i18n: area.title_i18n,
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
