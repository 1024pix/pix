import Model, { attr, hasMany } from '@ember-data/model';
import dayjs from 'dayjs';

const ONE_HOUR_45_MINUTES_IN_MS = 1 * 60 * 60 * 1000 + 45 * 60 * 1000;

export const assessmentStates = {
  COMPLETED: 'completed',
  STARTED: 'started',
  ABORTED: 'aborted',
  ENDED_BY_SUPERVISOR: 'endedBySupervisor',
  ENDED_DUE_TO_FINALIZATION: 'endedDueToFinalization',
};

export const abortReasons = {
  CANDIDATE: 'candidate',
  TECHNICAL: 'technical',
};

export default class V3CertificationCourseDetailsForAdministration extends Model {
  @attr('number') certificationCourseId;
  @attr('boolean') isRejectedForFraud;
  @attr('boolean') isCancelled;
  @attr('date') createdAt;
  @attr('date') completedAt;
  @attr('string') assessmentResultStatus;
  @attr('string') assessmentState;
  @attr('string') abortReason;
  @attr('number') pixScore;
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

  get duration() {
    const start = dayjs(this.createdAt);
    const end = dayjs(this.completedAt);
    return end.diff(start);
  }

  get hasExceededTimeLimit() {
    const defaultDurationInMs = ONE_HOUR_45_MINUTES_IN_MS;
    return this.duration > defaultDurationInMs;
  }

  get hasNotBeenCompletedByCandidate() {
    return [assessmentStates.ENDED_BY_SUPERVISOR, assessmentStates.ENDED_DUE_TO_FINALIZATION].includes(
      this.assessmentState,
    );
  }
}
