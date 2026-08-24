import { service } from '@ember/service';
import Model, { attr, hasMany } from '@warp-drive/legacy/model';
import { assessmentStates } from 'pix-admin/models/certification';

const ONE_HOUR_45_MINUTES_IN_MS = 1 * 60 * 60 * 1000 + 45 * 60 * 1000;

export const abortReasons = {
  CANDIDATE: 'candidate',
  TECHNICAL: 'technical',
};

export default class V3CertificationCourseDetailsForAdministration extends Model {
  @service intl;

  @attr('number') certificationCourseId;
  @attr('boolean') isRejectedForFraud;
  @attr('date') createdAt;
  @attr('date') lastAnswerAt;
  @attr('string') assessmentResultStatus;
  @attr('string') assessmentState;
  @attr('string') abortReason;
  @attr('number') pixScore;
  @attr('string') reachedResultKey;
  @attr('number') numberOfChallenges;
  @attr('string') certificationFramework;
  @hasMany('certification-challenges-for-administration', { async: true, inverse: null })
  certificationChallengesForAdministration;
  version = 3;

  get numberOfAnsweredQuestions() {
    const certificationChallengesForAdministration = this.hasMany('certificationChallengesForAdministration').value();
    if (!certificationChallengesForAdministration) return 0;
    return certificationChallengesForAdministration.filter((challenge) => {
      return challenge.answerStatus;
    }).length;
  }

  get wasFinalized() {
    return this.assessmentState === assessmentStates.ENDED_DUE_TO_FINALIZATION;
  }

  get wasEndedByInvigilator() {
    return this.assessmentState === assessmentStates.ENDED_BY_INVIGILATOR;
  }

  get numberOfOkAnswers() {
    const certificationChallengesForAdministration = this.hasMany('certificationChallengesForAdministration').value();
    if (!certificationChallengesForAdministration) return 0;
    return certificationChallengesForAdministration.filter((challenge) => challenge.isOk()).length;
  }

  get numberOfKoAnswers() {
    const certificationChallengesForAdministration = this.hasMany('certificationChallengesForAdministration').value();
    if (!certificationChallengesForAdministration) return 0;
    return certificationChallengesForAdministration.filter((challenge) => challenge.isKo()).length;
  }

  get numberOfAbandAnswers() {
    const certificationChallengesForAdministration = this.hasMany('certificationChallengesForAdministration').value();
    if (!certificationChallengesForAdministration) return 0;
    return certificationChallengesForAdministration.filter((challenge) => challenge.isAband()).length;
  }

  get numberOfValidatedLiveAlerts() {
    const certificationChallengesForAdministration = this.hasMany('certificationChallengesForAdministration').value();
    if (!certificationChallengesForAdministration) return 0;
    return certificationChallengesForAdministration.filter((challenge) => challenge.hasLiveAlert()).length;
  }

  get duration() {
    const start = new Date(this.createdAt);
    const end = new Date(this.lastAnswerAt);
    return end - start;
  }

  get hasExceededTimeLimit() {
    const defaultDurationInMs = ONE_HOUR_45_MINUTES_IN_MS;
    return this.duration > defaultDurationInMs;
  }

  get hasNotBeenCompletedByCandidate() {
    return [
      assessmentStates.ENDED_BY_INVIGILATOR,
      assessmentStates.ENDED_DUE_TO_FINALIZATION,
      assessmentStates.ENDED_DUE_TO_DURATION_EXCEEDED,
    ].includes(this.assessmentState);
  }

  get result() {
    return this.intl.t(`common.certification.meshLevels.${this.reachedResultKey}`, {
      pixScore: this.pixScore,
    });
  }

  get title() {
    const certificationTypeLabel = this.intl.t(
      `pages.certifications.certification.certification-types-v3.${this.certificationFramework}`,
    );
    return this.intl.t('pages.certifications.certification.details.v3.general-informations.title', {
      type: certificationTypeLabel,
      certificationCourseId: this.certificationCourseId,
    });
  }
}
