import _ from 'lodash';

import {
  MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY,
  MINIMUM_COMPETENCE_LEVEL_FOR_CERTIFIABILITY,
  PIX_COUNT_BY_LEVEL,
} from '../../../../shared/domain/constants.js';
import { UserCoreEligibility, UserEligibilityList } from './UserEligibilityList.js';

export const LABEL_FOR_CORE = 'CORE';

export class UserEligibilityCalculator {
  #eligibilities;
  #eligibilitiesV2;
  #hasBeenCalculated;

  constructor({ userId, date, eligibilities, eligibilitiesV2 }) {
    this.userId = userId;
    this.date = date;
    this.#eligibilities = eligibilities ?? [];
    this.#eligibilitiesV2 = eligibilitiesV2 ?? [];
    this.#hasBeenCalculated = false;
  }

  computeCoreEligibility({ allKnowledgeElements, coreCompetences }) {
    this.#hasBeenCalculated = true;
    const knowledgeElementsGroupedByCompetence = _.groupBy(allKnowledgeElements, 'competenceId');
    let countAtLeastLevelOneCompetences = 0;
    for (const competence of coreCompetences) {
      const knowledgeElementsForCompetence = knowledgeElementsGroupedByCompetence[competence.id];
      const totalEarnedPix = _.sumBy(knowledgeElementsForCompetence, 'earnedPix');
      const level = Math.floor(totalEarnedPix / PIX_COUNT_BY_LEVEL);
      if (level >= MINIMUM_COMPETENCE_LEVEL_FOR_CERTIFIABILITY) {
        ++countAtLeastLevelOneCompetences;
      }
      if (countAtLeastLevelOneCompetences >= MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY) {
        break;
      }
    }

    const isCertifiable = countAtLeastLevelOneCompetences >= MINIMUM_CERTIFIABLE_COMPETENCES_FOR_CERTIFIABILITY;
    this.#eligibilities.push(buildCoreEligibility({ isCertifiable }));
    this.#eligibilitiesV2.push(buildCoreEligibility({ isCertifiable }));
  }

  buildUserEligibilityList() {
    if (!this.#hasBeenCalculated) throw new Error('Cannot produce final UserEligibilityList before computing them.');
    return new UserEligibilityList({
      userId: this.userId,
      date: this.date,
      eligibilities: this.#eligibilities,
      eligibilitiesV2: this.#eligibilitiesV2,
    });
  }

  toDTO() {
    return {
      userId: this.userId,
      date: this.date,
      eligibilities: this.#eligibilities.map((eligibility) => eligibility.toDTO()),
      eligibilitiesV2: this.#eligibilitiesV2.map((eligibilityV2) => eligibilityV2.toDTO()),
    };
  }
}

function buildCoreEligibility({ isCertifiable }) {
  return new UserCoreEligibility({ isCertifiable });
}
