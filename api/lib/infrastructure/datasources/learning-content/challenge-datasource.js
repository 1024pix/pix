import _ from 'lodash';
import * as datasource from './datasource.js';
import { LearningContentResourceNotFound } from './LearningContentResourceNotFound.js';

const VALIDATED_CHALLENGE = 'validé';
// donnée temporaire pour pix1d le temps d'arriver en « prod »
const PROPOSED_CHALLENGE = 'proposé';
const OBSOLETE_CHALLENGE = 'périmé';
const OPERATIVE_CHALLENGES = [VALIDATED_CHALLENGE, 'archivé'];

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

  async getBySkillId(skillId) {
    const challenges = await this.list();
    const filteredChallenges = challenges.filter(
      (challenge) =>
        challenge.skillId === skillId &&
        (challenge.status === VALIDATED_CHALLENGE || challenge.status === PROPOSED_CHALLENGE),
    );

    if (_.isEmpty(filteredChallenges)) {
      throw new LearningContentResourceNotFound();
    }
    return filteredChallenges;
  },

  async findActiveFlashCompatible(locale) {
    const flashChallenges = await this.findFlashCompatible({ locale });
    return flashChallenges.filter((challengeData) => challengeData.status === VALIDATED_CHALLENGE);
  },

  async findOperativeFlashCompatible(locale) {
    const flashChallenges = await this.findFlashCompatible({ locale });
    return flashChallenges.filter((challengeData) => _.includes(OPERATIVE_CHALLENGES, challengeData.status));
  },

  async findFlashCompatible({ locale, useObsoleteChallenges }) {
    const challenges = await this.list();

    const acceptedStatuses = useObsoleteChallenges
      ? [OBSOLETE_CHALLENGE, ...OPERATIVE_CHALLENGES]
      : OPERATIVE_CHALLENGES;

    return challenges.filter(
      (challengeData) =>
        (!locale || _.includes(challengeData.locales, locale)) &&
        challengeData.alpha != null &&
        challengeData.delta != null &&
        challengeData.skillId &&
        acceptedStatuses.includes(challengeData.status),
    );
  },
});

export { challengeDatasource };
