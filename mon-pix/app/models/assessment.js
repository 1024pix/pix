/* eslint ember/no-computed-properties-in-native-classes: 0 */

import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import { equal, or, not, and } from '@ember/object/computed';
import ENV from 'mon-pix/config/environment';

export const assessmentStates = {
  COMPLETED: 'completed',
  STARTED: 'started',
  ABORTED: 'aborted',
  ENDED_BY_SUPERVISOR: 'endedBySupervisor',
  ENDED_DUE_TO_FINALIZATION: 'endedDueToFinalization',
};
export default class Assessment extends Model {
  // attributes
  @attr('string') certificationNumber;
  @attr('string') codeCampaign;
  @attr('string') state;
  @attr('string') title;
  @attr('string') type;
  @attr('string') lastQuestionState;
  @attr('string') method;
  @attr('boolean', { defaultValue: false }) hasOngoingLiveAlert;

  // references
  @attr('string') competenceId;

  // includes
  @hasMany('answer') answers;
  @belongsTo('certification-course') certificationCourse;
  @belongsTo('course', { inverse: null }) course;
  @belongsTo('progression', { inverse: null }) progression;

  // methods
  @equal('type', 'CERTIFICATION') isCertification;
  @equal('type', 'COMPETENCE_EVALUATION') isCompetenceEvaluation;
  @equal('type', 'DEMO') isDemo;
  @equal('type', 'PREVIEW') isPreview;
  @equal('type', 'CAMPAIGN') isForCampaign;

  @equal('method', 'FLASH') isFlash;
  @not('isFlash') isNotFlash;
  @and('isForCampaign', 'isNotFlash') isForNotFlashCampaign;

  @equal('state', 'aborted') isAborted;
  @equal('state', 'completed') isCompleted;
  @equal('state', 'started') isStarted;

  @equal('lastQuestionState', 'timeout') hasTimeoutChallenge;
  @equal('lastQuestionState', 'focusedout') hasFocusedOutChallenge;

  @or('isCompetenceEvaluation', 'isForNotFlashCampaign') hasCheckpoints;
  @or('isCompetenceEvaluation', 'isForNotFlashCampaign') showLevelup;
  @or('isCompetenceEvaluation', 'isForNotFlashCampaign', 'isDemo') showProgressBar;

  get answersSinceLastCheckpoints() {
    const answers = this.answers.toArray();
    const howManyAnswersSinceTheLastCheckpoint = answers.length % ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS;
    const sliceAnswersFrom =
      howManyAnswersSinceTheLastCheckpoint === 0
        ? -ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS
        : -howManyAnswersSinceTheLastCheckpoint;
    return answers.slice(sliceAnswersFrom);
  }

  get currentChallengeNumber() {
    return this.answers.length;
  }
}
