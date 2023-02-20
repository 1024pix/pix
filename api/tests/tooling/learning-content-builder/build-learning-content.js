import _ from 'lodash';
import { LOCALE } from '../../../lib/domain/constants';

const { FRENCH_FRANCE: FRENCH_FRANCE, FRENCH_SPOKEN: FRENCH_SPOKEN, ENGLISH_SPOKEN: ENGLISH_SPOKEN } = LOCALE;

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
              practicalTitle_i18n: {
                fr: tube.practicalTitleFr || tube.practicalTitle,
                en: tube.practicalTitleEn || tube.practicalTitle,
              },
              practicalDescription_i18n: {
                fr: tube.practicalDescriptionFr || tube.practicalDescription,
                en: tube.practicalDescriptionEn || tube.practicalDescription,
              },
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
              name_i18n: {
                fr: thematic.nameFr || thematic.name,
                en: thematic.nameEn || thematic.name,
              },
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
          name_i18n: {
            fr: competence.nameFr || competence.name,
            en: competence.nameEn || competence.name,
          },
          description_i18n: {
            fr: competence.descriptionFr || competence.description,
            en: competence.descriptionEn || competence.description,
          },
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
        title_i18n: {
          fr: area.titleFr,
          en: area.titleEn,
        },
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

export default buildLearningContent;
