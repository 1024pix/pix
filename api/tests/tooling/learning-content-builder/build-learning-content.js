const _ = require('lodash');
const { FRENCH_FRANCE, FRENCH_SPOKEN, ENGLISH_SPOKEN } = require('../../../lib/domain/constants').LOCALE;

const buildLearningContent = function(learningContent) {
  const allCompetences = [];
  const allTubes = [];
  const allSkills = [];
  const allChallenges = [];
  const allCourses = [];
  const areas = learningContent.map((area) => {
    const competences = area.competences.map((competence) => {
      const tubes = competence.tubes.map((tube) => {
        const skills = tube.skills.map((skill) => {
          const challenges = skill.challenges.map((challenge) => {
            const sameChallengeForAnotherSkill = allChallenges.flat().find((otherSkillChallenge) => otherSkillChallenge.id === challenge.id);
            if (!sameChallengeForAnotherSkill) {
              return {
                id: challenge.id,
                competenceId: competence.id,
                skillIds: [skill.id],
                status: challenge.statut || 'validé',
                locales: _convertLanguesToLocales(challenge.langues || ['Francophone']),
              };
            } else {
              sameChallengeForAnotherSkill.skillIds.push(skill.id);
            }
          });
          allChallenges.push(challenges);
          return {
            id: skill.id,
            tubeId: tube.id,
            status: skill.status || 'actif',
            competenceId: competence.id,
            name: skill.nom,
            pixValue: skill.pixValue,
            tutorialIds: skill.tutorialIds,
          };
        });
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
      allTubes.push(tubes);
      return {
        id: competence.id,
        skillIds: competence.tubes.flatMap((tube) => tube.skills).map((skill) => skill.id),
        areaId: area.id,
        origin: competence.origin || 'Pix',
        index: competence.index,
        nameFrFr: competence.name,
      };
    });
    allCompetences.push(competences);
    const courses = area.courses && area.courses.map((course) => {
      return {
        id: course.id,
        challenges: course.challengeIds,
        name: course.name,
        description: course.description,
      };
    });
    allCourses.push(courses);
    return {
      id: area.id,
      code: area.code,
      name: area.name,
      titleFrFr: area.titleFr,
      titleEnUs: area.titleEn,
      color: area.color,
      competenceIds: competences.map((competence) => competence.id),
    };
  });
  return {
    areas,
    competences: allCompetences.flat(),
    tubes: allTubes.flat(),
    skills: allSkills.flat(),
    challenges: _.compact(allChallenges.flat()),
    courses: _.compact(allCourses.flat()),
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

module.exports = buildLearningContent;
