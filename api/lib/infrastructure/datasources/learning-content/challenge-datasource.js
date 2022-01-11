const _ = require('lodash');
const datasource = require('./datasource');

const VALIDATED_CHALLENGE = 'validé';
const OPERATIVE_CHALLENGES = [VALIDATED_CHALLENGE, 'archivé'];

module.exports = datasource.extend({
  modelName: 'challenges',

  async findOperativeBySkillIds(skillIds) {
    const foundInSkillIds = (skillId) => _.includes(skillIds, skillId);
    const challenges = await this.findOperative();
    return challenges.filter((challengeData) => _.some(challengeData.skillIds, foundInSkillIds));
  },

  async findValidatedByCompetenceId(competenceId) {
    const challenges = await this.findValidated();
    return challenges.filter(
      (challengeData) => !_.isEmpty(challengeData.skillIds) && _.includes(challengeData.competenceId, competenceId)
    );
  },

  async findOperative() {
    const challenges = await this.list();
    return challenges.filter((challengeData) => _.includes(OPERATIVE_CHALLENGES, challengeData.status));
  },

  async findOperativeHavingLocale(locale) {
    const operativeChallenges = await this.findOperative();
    return operativeChallenges.filter((challenge) => _.includes(challenge.locales, locale));
  },

  async findValidated() {
    const challenges = await this.list();
    return challenges.filter((challengeData) => challengeData.status === VALIDATED_CHALLENGE);
  },

  async findFlashCompatible(locale) {
    const challenges = await this.list();
    return challenges.filter(
      (challengeData) =>
        challengeData.status === VALIDATED_CHALLENGE &&
        !_.isEmpty(challengeData.skillIds) &&
        _.includes(challengeData.locales, locale) &&
        challengeData.alpha != null &&
        challengeData.delta != null
    );
  },
});
