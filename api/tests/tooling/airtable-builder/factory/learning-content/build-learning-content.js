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
              return buildChallenge({
                id: challenge.id,
                competences: [competence.id],
                acquix: [skill.id],
                statut: challenge.statut,
                langues: challenge.langues,
              });
            } else {
              sameChallengeForAnotherSkill.fields['Acquix (id persistant)'].push(skill.id);
              return;
            }
          });
          allChallenges.push(challenges);
          return buildSkill(
            {
              id: skill.id,
              epreuves: [skill.challenges.map((challenge) => challenge.id)],
              tube: [tube.id],
              status: skill.status,
              compétenceViaTube: [competence.id],
              nom: skill.nom,
              pixValue: skill.pixValue,
              comprendre: skill.tutorialIds,
            },
          );
        });
        allSkills.push(skills);
        return buildTube(
          {
            id: tube.id,
            nom: tube.name,
            description: tube.description,
            titre: tube.title,
            titrePratiqueFrFr: tube.practicalTitleFr || tube.practicalTitle,
            descriptionPratiqueFrFr: tube.practicalDescriptionFr || tube.practicalDescription,
            titrePratiqueEnUs: tube.practicalTitleEn || tube.practicalTitle,
            descriptionPratiqueEnUs: tube.practicalDescriptionEn || tube.practicalDescription,
            competences: [competence.id],
          },
        );
      });
      allTubes.push(tubes);
      return buildCompetence(
        {
          id: competence.id,
          epreuves: competence.tubes.flatMap((tube) => tube.skills).flatMap((skill) => skill.challenges).map((challenge) => challenge.id),
          tubes: competence.tubes.map((tube) => tube.id),
          acquisViaTubes: competence.tubes.flatMap((tube) => tube.skills).map((skill) => skill.id),
          domaineIds: [area.id],
          origin: competence.origin,
          sousDomaine: competence.index,
          titre: competence.name,
        },
      );
    });
    allCompetences.push(competences);
    return buildArea({
      id: area.id,
      code: area.code,
      nom: area.name,
      titreFr: area.titleFr,
      titreEn: area.titleEn,
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

module.exports = buildLearningContent;
