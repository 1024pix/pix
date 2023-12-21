import Model, { attr, hasMany } from '@ember-data/model';
export default class V3CertificationCourseDetailsForAdministration extends Model {
  @attr() certificationCourseId;
  @hasMany('certification-challenges-for-administration') certificationChallengesForAdministration;
  version = 3;

  get numberOfAnsweredQuestions() {
    return this.certificationChallengesForAdministration.filter((challenge) => {
      return challenge.answerStatus;
    }).length;
  }

  get totalNumberOfQuestions() {
    // TODO: save the number of questions at the start of a certification to get it here
    return 32;
  }

  get numberOfOkAnswers() {
    return this.certificationChallengesForAdministration.filter((challenge) => challenge.isOk()).length;
  }

  get numberOfKoAnswers() {
    return this.certificationChallengesForAdministration.filter((challenge) => challenge.isKo()).length;
  }

  get numberOfAbandAnswers() {
    return this.certificationChallengesForAdministration.filter((challenge) => challenge.isAband()).length;
  }

  get numberOfValidatedLiveAlerts() {
    return this.certificationChallengesForAdministration.filter((challenge) => challenge.hasLiveAlert()).length;
  }
}
