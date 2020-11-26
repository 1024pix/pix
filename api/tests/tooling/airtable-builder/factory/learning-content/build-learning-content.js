const _ = require('lodash');
const buildSkill = require('../build-skill');
const buildChallenge = require('../build-challenge');
const buildTube = require('../build-tube');
const buildCompetence = require('../build-competence');
const buildArea = require('../build-area');
const { FRENCH_FRANCE, ENGLISH_SPOKEN } = require('../../../../../lib/domain/constants').LOCALE;

const buildLearningContent = function(learningContent) {
  const allCompetences = [];
  const allTubes = [];
  const allSkills = [];
  const allChallenges = [];
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
                locales: _convertLanguesToLocales(challenge.langues || ['fr']),
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
  };
};

buildLearningContent.fromTargetProfileWithLearningContent = function buildLearningContentFromTargetProfileWithLearningContent({
  targetProfile,
  locale = FRENCH_FRANCE,
}) {
  const allCompetences = [];
  const allTubes = [];
  const allSkills = [];
  const areas = targetProfile.areas.map((area) => {
    const competences = area.competences.map((competence) => {
      const tubes = competence.tubes.map((tube) => {
        const skills = tube.skills.map((skill) => {
          return buildSkill(
            {
              id: skill.id,
              epreuves: [],
              tube: [tube.id],
              compétenceViaTube: [competence.id],
              nom: skill.name,
              comprendre: skill.tutorialIds,
            },
          );
        });
        allSkills.push(skills);
        return buildTube(
          {
            id: tube.id,
            titrePratiqueFrFr: locale === FRENCH_FRANCE ? tube.practicalTitle : null,
            titrePratiqueEnUs: locale === ENGLISH_SPOKEN ? tube.practicalTitle : null,
            competences: [competence.id],
          },
        );
      });
      allTubes.push(tubes);
      return buildCompetence(
        {
          id: competence.id,
          epreuves: [],
          tubes: competence.tubes.map((tube) => tube.id),
          acquisViaTubes: competence.tubes.flatMap((tube) => tube.skills).map((skill) => skill.id),
          domaineIds: [area.id],
          sousDomaine: competence.index,
          titreFrFr: locale === FRENCH_FRANCE ? competence.name : null,
          titreEnUs: locale === ENGLISH_SPOKEN ? competence.name : null,
        },
      );
    });
    allCompetences.push(competences);
    return buildArea({
      id: area.id,
      code: area.code,
      titreFr: locale === FRENCH_FRANCE ? area.title : null,
      titreEn: locale === ENGLISH_SPOKEN ? area.title : null,
      couleur: area.color,
      competenceIds: competences.map((competence) => competence.id),
      nomCompetences: competences.map((competence) => competence.name),
    });
  });
  return {
    areas,
    competences: allCompetences.flat(),
    tubes: allTubes.flat(),
    skills: allSkills.flat(),
  };
};

function _convertLanguesToLocales(langues) {
  return langues.map((langue) => {
    if (langue === 'Francophone') {
      return 'fr';
    }
    if (langue === 'Franco Français') {
      return 'fr-fr';
    }
    if (langue === 'Anglais') {
      return 'en';
    }
  });
}

module.exports = buildLearningContent;
