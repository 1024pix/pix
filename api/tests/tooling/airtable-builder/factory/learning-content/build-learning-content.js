const _ = require('lodash');
const buildSkill = require('../build-skill');
const buildChallenge = require('../build-challenge');
const buildTube = require('../build-tube');
const buildCompetence = require('../build-competence');
const buildArea = require('../build-area');

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
                langues: challenge.langues
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
              nom: skill.nom
            }
          );
        });
        allSkills.push(skills);
        return buildTube(
          {
            id: tube.id,
            competences: [competence.id]
          }
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
          origin: competence.origin
        }
      );
    });
    allCompetences.push(competences);
    return buildArea({
      id: area.id,
      competenceIds: competences.map((competence) => competence.id),
      nomCompetences: competences.map((competence) => competence.name)
    });
  });
  return {
    areas,
    competences: allCompetences.flat(),
    tubes: allTubes.flat(),
    skills: allSkills.flat(),
    challenges: _.compact(allChallenges.flat())
  };
};

module.exports = buildLearningContent;
