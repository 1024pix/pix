/* eslint ember/no-computed-properties-in-native-classes: 0 */

import { equal } from '@ember/object/computed';
import Model, { attr, belongsTo, hasMany } from '@ember-data/model';
import ENV from 'mon-pix/config/environment';

export const assessmentStates = {
  COMPLETED: 'completed',
  STARTED: 'started',
  ABORTED: 'aborted',
  ENDED_BY_INVIGILATOR: 'endedByInvigilator',
  ENDED_DUE_TO_FINALIZATION: 'endedDueToFinalization',
};
export default class Assessment extends Model {
  // attributes
  @attr('date') createdAt;
  @attr('string') certificationNumber;
  @attr('string') codeCampaign;
  @attr('string') state;
  @attr('string') title;
  @attr('string') type;
  @attr('string') lastQuestionState;
  @attr('string') method;
  @attr('boolean', { defaultValue: false }) hasOngoingChallengeLiveAlert;
  @attr('boolean') hasOngoingCompanionLiveAlert;
  @attr('boolean') hasCheckpoints;
  @attr('boolean') showChallengeStepper;
  @attr('boolean') showGlobalProgression;
  @attr('boolean') showLevelup;
  @attr('boolean') showQuestionCounter;
  @attr('number') globalProgression;
  @attr orderedChallengeIdsAnswered;

  // references
  @attr('string') competenceId;

  // includes
  @hasMany('answer', { async: true, inverse: 'assessment' }) answers;
  @belongsTo('certification-course', { async: true, inverse: 'assessment' }) certificationCourse;
  @belongsTo('course', { async: true, inverse: null }) course;
  @belongsTo('progression', { async: true, inverse: null }) progression;
  @belongsTo('challenge', { async: false, inverse: null }) nextChallenge;
  @belongsTo('campaign', { async: true, inverse: null }) campaign;

  // methods
  @equal('type', 'CERTIFICATION') isCertification;
  @equal('type', 'COMPETENCE_EVALUATION') isCompetenceEvaluation;
  @equal('type', 'DEMO') isDemo;
  @equal('type', 'PREVIEW') isPreview;
  @equal('type', 'CAMPAIGN') isForCampaign;

  @equal('state', 'aborted') isAborted;
  @equal('state', 'completed') isCompleted;
  @equal('state', 'started') isStarted;

  @equal('lastQuestionState', 'timeout') hasTimeoutChallenge;
  @equal('lastQuestionState', 'focusedout') hasFocusedOutChallenge;

  get answersSinceLastCheckpoints() {
    const howManyAnswersSinceTheLastCheckpoint =
      this.currentChallengeNumber % ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS;
    const sliceAnswersFrom =
      howManyAnswersSinceTheLastCheckpoint === 0
        ? -ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS
        : -howManyAnswersSinceTheLastCheckpoint;
    return this.hasMany('answers').value().slice(sliceAnswersFrom);
  }

  get currentChallengeNumber() {
    return this.orderedChallengeIdsAnswered.length;
  }
}
