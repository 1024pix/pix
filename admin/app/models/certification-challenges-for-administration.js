import Model, { attr } from '@ember-data/model';

export const AnswerStatus = {
  OK: 'ok',
  KO: 'ko',
  ABAND: 'aband',
  TIMEDOUT: 'timedout',
  FOCUSEDOUT: 'focusedOut',
  UNIMPLEMENTED: 'unimplemented',
};
export default class CertificationChallengesForAdministration extends Model {
  @attr() answerStatus;
  @attr() answeredAt;
  @attr() answerValue;
  @attr() competenceIndex;
  @attr() competenceName;
  @attr() validatedLiveAlert;
  @attr() skillName;
  @attr() questionNumber;
  version = 3;

  isOk() {
    return this.answerStatus === 'ok';
  }

  isKo() {
    return this.answerStatus === 'ko';
  }

  isAband() {
    return this.answerStatus === 'aband';
  }

  hasLiveAlert() {
    return !!this.validatedLiveAlert;
  }
}
