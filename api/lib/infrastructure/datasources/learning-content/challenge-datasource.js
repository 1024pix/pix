import isEmpty from 'lodash/isEmpty.js';
import * as datasource from './datasource.js';
import { LearningContentResourceNotFound } from './LearningContentResourceNotFound.js';

const VALIDATED_CHALLENGE = 'validé';
// donnée temporaire pour pix1d le temps d'arriver en « prod »
const PROPOSED_CHALLENGE = 'proposé';
const OBSOLETE_CHALLENGE = 'périmé';
const OPERATIVE_CHALLENGES = [VALIDATED_CHALLENGE, 'archivé'];

function _challengeHasStatus(challenge, statuses) {
  return statuses.includes(challenge.status);
}

function _challengeHasLocale(challenge, locale) {
  return challenge.locales.includes(locale);
}

const challengeDatasource = datasource.extend({
  modelName: 'challenges',

  async findOperativeBySkillIds(skillIds, locale) {
    const foundInSkillIds = (skillId) => skillIds.includes(skillId);
    const challenges = await this.findOperative(locale);
    return challenges.filter((challengeData) => foundInSkillIds(challengeData.skillId));
  },

  async findOperative(locale) {
    const challenges = await this.list();
    return challenges.filter(
      (challenge) => _challengeHasLocale(challenge, locale) && _challengeHasStatus(challenge, OPERATIVE_CHALLENGES),
    );
  },

  async findValidatedByCompetenceId(competenceId, locale) {
    const challenges = await this.findValidated(locale);
    return challenges.filter(
      (challengeData) => !isEmpty(challengeData.skillId) && challengeData.competenceId === competenceId,
    );
  },

  async findValidatedBySkillId(id, locale) {
    const validatedChallenges = await this.findValidated(locale);
    return validatedChallenges.filter((challenge) => challenge.skillId === id);
  },

  async findValidated(locale) {
    const challenges = await this.list();
    return challenges.filter(
      (challenge) => _challengeHasLocale(challenge, locale) && _challengeHasStatus(challenge, [VALIDATED_CHALLENGE]),
    );
  },

  async getBySkillId(skillId) {
    const challenges = await this.list();
    const filteredChallenges = challenges.filter(
      (challenge) =>
        challenge.skillId === skillId && _challengeHasStatus(challenge, [VALIDATED_CHALLENGE, PROPOSED_CHALLENGE]),
    );

    if (isEmpty(filteredChallenges)) {
      throw new LearningContentResourceNotFound({ skillId });
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
