const _ = require('lodash');
const buildSkill = require('./build-skill');
const buildChallenge = require('./build-challenge');
const buildCompetence = require('./build-competence');
const buildArea = require('./build-area');

const {
  MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY,
  MAX_CHALLENGES_PER_SKILL_FOR_CERTIFICATION,
} = require('../../../../lib/domain/constants');

module.exports = function buildLearningContentForCertification() {
  const area = buildArea();
  const competences = _.times(MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY, () => {
    return buildCompetence();
  });

  const skills = [];
  const challenges = [];
  const skillsAndChallengesByCompetences = _.map(competences, (competence) => {
    return _.times(MAX_CHALLENGES_PER_SKILL_FOR_CERTIFICATION, () => {
      const skill = buildSkill({ 'compétenceViaTube': competence.id });
      const challenge = buildChallenge({ statut: 'validé', competences:[competence.id], acquix: [skill.id] });
      skills.push(skill);
      challenges.push(challenge);
      return { competenceId: competence.id, skillId: skill.id, challengeId: challenge.id };
    });
  });
  const competencesAssociatedSkillsAndChallenges = _.flattenDeep(skillsAndChallengesByCompetences);

  return {
    area,
    competences,
    skills,
    challenges,
    competencesAssociatedSkillsAndChallenges,
  };
};
