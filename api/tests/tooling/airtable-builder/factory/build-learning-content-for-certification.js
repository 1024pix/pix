const _ = require('lodash');
const buildSkill = require('./build-skill');
const buildChallenge = require('./build-challenge');
const buildTube = require('./build-tube');
const buildCompetence = require('./build-competence');
const buildArea = require('./build-area');

const {
  MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY,
  MAX_CHALLENGES_PER_SKILL_FOR_CERTIFICATION,
} = require('../../../../lib/domain/constants');

module.exports = function buildLearningContentForCertification() {
  const area = buildArea();
  const competences = [];
  const tubes = [];
  const skills = [];
  const challenges = [];
  let competencesAssociatedSkillsAndChallenges = _.times(MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY, (competenceIndex) => {
    const competence = buildCompetence({ id: `recCompetence${competenceIndex}`, titre: `Compétence ${competenceIndex}`, epreuves: [], tubes: [], acquisViaTubes: [] });
    const competenceAssociatedSkillsAndChallenges = _.times(MAX_CHALLENGES_PER_SKILL_FOR_CERTIFICATION, (skillIndex) => {
      const tube = buildTube({ id: `recTube${competenceIndex}_${skillIndex}`, competences: [ competence.id ] });
      const skill = buildSkill({ id: `recSkill${competenceIndex}_${skillIndex}`, compétenceViaTube: [ competence.id ], tube: [ tube.id ] });
      const challenge = buildChallenge({ id: `recChallenge${competenceIndex}_${skillIndex}`, competences: [ competence.id ], acquix: [ skill.id ] });
      skill['fields']['Epreuves'] = [ challenge.id ];

      competence['fields']['Tubes'].push(tube.id);
      competence['fields']['Acquis (via Tubes) (id persistant)'].push(skill.id);
      competence['fields']['Epreuves'].push(challenge.id);
      tubes.push(tube);
      skills.push(skill);
      challenges.push(challenge);
      return { competenceId: competence.id, skillId: skill.id, challengeId: challenge.id };
    });
    competences.push(competence);
    return competenceAssociatedSkillsAndChallenges;
  });
  competencesAssociatedSkillsAndChallenges = _.flattenDeep(competencesAssociatedSkillsAndChallenges);

  return {
    area,
    competences,
    tubes,
    skills,
    challenges,
    competencesAssociatedSkillsAndChallenges,
  };
};
