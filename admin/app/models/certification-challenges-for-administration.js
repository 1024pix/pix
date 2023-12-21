import Model, { attr } from '@ember-data/model';
export default class CertificationChallengesForAdministration extends Model {
  @attr() answerStatus;
  @attr() validatedLiveAlert;
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
