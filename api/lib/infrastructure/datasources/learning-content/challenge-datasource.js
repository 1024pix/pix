const _ = require('lodash');
const datasource = require('./datasource');
const { FRENCH_FRANCE } = require('../../../domain/constants').LOCALE;

const VALIDATED_CHALLENGES = ['validé', 'validé sans test', 'pré-validé'];
const OPERATIVE_CHALLENGES = [...VALIDATED_CHALLENGES, 'archivé'];

module.exports = datasource.extend({

  modelName: 'challenges',

  async findOperativeBySkillIds(skillIds) {
    const foundInSkillIds = (skillId) => _.includes(skillIds, skillId);
    const challenges = await this.findOperative();
    return challenges.filter((challengeData) =>
      _.some(challengeData.skillIds, foundInSkillIds),
    );
  },

  async findValidatedByCompetenceId(competenceId) {
    const challenges = await this.findValidated();
    return challenges.filter((challengeData) =>
      !_.isEmpty(challengeData.skillIds)
      && _.includes(challengeData.competenceId, competenceId),
    );
  },

  async findOperative() {
    const challenges = await this.list();
    return challenges.filter((challengeData) =>
      _.includes(OPERATIVE_CHALLENGES, challengeData.status));
  },

  async _findOperativeHavingLocale(locale) {
    const operativeChallenges = await this.findOperative();
    return operativeChallenges.filter((challenge) => _.includes(challenge.locales, locale));
  },

  async findFrenchFranceOperative() {
    return this._findOperativeHavingLocale(FRENCH_FRANCE);
  },

  async findValidated() {
    const challenges = await this.list();
    return challenges.filter((challengeData) =>
      _.includes(VALIDATED_CHALLENGES, challengeData.status));
  },
});
