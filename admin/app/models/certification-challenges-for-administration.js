import Model, { attr } from '@ember-data/model';

import { ANSWER_STATUSES } from '../constants';

export default class CertificationChallengesForAdministration extends Model {
  @attr() answerStatus;
  @attr() answeredAt;
  @attr() answerValue;
  @attr() competenceIndex;
  @attr() competenceName;
  @attr() validatedLiveAlert;
  @attr() skillName;
  version = 3;

  isOk() {
    return this.answerStatus === ANSWER_STATUSES.OK;
  }

  isKo() {
    return this.answerStatus === ANSWER_STATUSES.KO;
  }

  isAband() {
    return this.answerStatus === ANSWER_STATUSES.ABAND;
  }

  hasLiveAlert() {
    return !!this.validatedLiveAlert;
  }
}
