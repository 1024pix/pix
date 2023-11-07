import _ from 'lodash';
import * as datasource from './datasource.js';
import { LearningContentResourceNotFound } from './LearningContentResourceNotFound.js';

const VALIDATED_CHALLENGE = 'validé';
// donnée temporaire pour pix1d le temps d'arriver en « prod »
const PROPOSED_CHALLENGE = 'proposé';
const OBSOLETE_CHALLENGE = 'périmé';
const OPERATIVE_CHALLENGES = [VALIDATED_CHALLENGE, 'archivé'];

function _challengeHasStatus(challenge, statuses) {
  return _.includes(statuses, challenge.status);
}

function _challengeHasLocale(challenge, locale) {
  return _.includes(challenge.locales, locale);
}

const challengeDatasource = datasource.extend({
  modelName: 'challenges',

  async findOperativeBySkillIds(skillIds) {
    const foundInSkillIds = (skillId) => _.includes(skillIds, skillId);
    const challenges = await this.findOperative();
    return challenges.filter((challengeData) => foundInSkillIds(challengeData.skillId));
  },

  async findValidatedByCompetenceId(competenceId) {
    const challenges = await this.findValidated();
    return challenges.filter(
      (challengeData) => !_.isEmpty(challengeData.skillId) && _.includes(challengeData.competenceId, competenceId),
    );
  },

  async findOperative() {
    const challenges = await this.list();
    return challenges.filter((challengeData) => _challengeHasStatus(challengeData, OPERATIVE_CHALLENGES));
  },

  async findOperativeHavingLocale(locale) {
    const operativeChallenges = await this.findOperative();
    return operativeChallenges.filter((challenge) => _challengeHasLocale(challenge, locale));
  },

  async findValidated() {
    const challenges = await this.list();
    return challenges.filter((challengeData) => _challengeHasStatus(challengeData, [VALIDATED_CHALLENGE]));
  },

  async findValidatedBySkillId(id) {
    const validatedChallenges = await this.findValidated();
    return validatedChallenges.filter((challenge) => challenge.skillId === id);
  },

  async getBySkillId(skillId) {
    const challenges = await this.list();
    const filteredChallenges = challenges.filter(
      (challenge) =>
        challenge.skillId === skillId && _challengeHasStatus(challenge, [VALIDATED_CHALLENGE, PROPOSED_CHALLENGE]),
    );

    if (_.isEmpty(filteredChallenges)) {
      throw new LearningContentResourceNotFound();
    }
    return filteredChallenges;
  },

  async findActiveFlashCompatible(locale) {
    const flashChallenges = await this.findFlashCompatible({ locale });
    return flashChallenges.filter((challengeData) => _challengeHasStatus(challengeData, [VALIDATED_CHALLENGE]));
  },

  async findOperativeFlashCompatible(locale) {
    const flashChallenges = await this.findFlashCompatible({ locale });
    return flashChallenges.filter((challengeData) => _challengeHasStatus(challengeData, OPERATIVE_CHALLENGES));
  },

  async findFlashCompatible({ locale, useObsoleteChallenges }) {
    const challenges = await this.list();

    const acceptedStatuses = useObsoleteChallenges
      ? [OBSOLETE_CHALLENGE, ...OPERATIVE_CHALLENGES]
      : OPERATIVE_CHALLENGES;

    return challenges.filter(
      (challengeData) =>
        (!locale || _challengeHasLocale(challengeData, locale)) &&
        challengeData.alpha != null &&
        challengeData.delta != null &&
        challengeData.skillId &&
        _challengeHasStatus(challengeData, acceptedStatuses),
    );
  },
});

export { challengeDatasource };
