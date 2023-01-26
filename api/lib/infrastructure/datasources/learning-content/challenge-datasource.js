const _ = require('lodash');
const datasource = require('./datasource');

const VALIDATED_CHALLENGE = 'validé';
const OPERATIVE_CHALLENGES = [VALIDATED_CHALLENGE, 'archivé'];

module.exports = datasource.extend({
  modelName: 'challenges',

  async findOperativeBySkillIds(skillIds) {
    const foundInSkillIds = (skillId) => _.includes(skillIds, skillId);
    const challenges = await this.findOperative();
    return challenges.filter((challengeData) => foundInSkillIds(challengeData.skillId));
  },

  async findValidatedByCompetenceId(competenceId) {
    const challenges = await this.findValidated();
    return challenges.filter(
      (challengeData) => !_.isEmpty(challengeData.skillId) && _.includes(challengeData.competenceId, competenceId)
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

  async findValidatedBySkillId(id) {
    const validatedChallenges = await this.findValidated();
    return validatedChallenges.filter((challenge) => challenge.skillId === id);
  },

  async findActiveFlashCompatible(locale) {
    const challenges = await this.list();
    return challenges.filter(
      (challengeData) =>
        challengeData.status === VALIDATED_CHALLENGE &&
        challengeData.skillId &&
        _.includes(challengeData.locales, locale) &&
        challengeData.alpha != null &&
        challengeData.delta != null
    );
  },

  async findOperativeFlashCompatible(locale) {
    const challenges = await this.list();
    return challenges.filter(
      (challengeData) =>
        _.includes(OPERATIVE_CHALLENGES, challengeData.status) &&
        challengeData.skillId &&
        _.includes(challengeData.locales, locale) &&
        challengeData.alpha != null &&
        challengeData.delta != null
    );
  },
});
