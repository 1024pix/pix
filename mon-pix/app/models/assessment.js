import Model, { attr, hasMany, belongsTo } from '@ember-data/model';
import { equal, or } from '@ember/object/computed';
import { computed } from '@ember/object';
import ENV from 'mon-pix/config/environment';

export default class Assessment extends Model {

  // attributes
  @attr('string') certificationNumber;
  @attr('string') codeCampaign;
  @attr('string') state;
  @attr('string') title;
  @attr('string') type;

  // references
  @attr('string') competenceId;
  @attr('string') participantExternalId;

  // includes
  @hasMany('answer') answers;
  @belongsTo('certification-course') certificationCourse;
  @belongsTo('course', { inverse: null }) course;
  @belongsTo('progression', { inverse: null }) progression;
  @belongsTo('assessment-result') result;

  // methods
  @equal('type', 'CERTIFICATION') isCertification;
  @equal('type', 'COMPETENCE_EVALUATION') isCompetenceEvaluation;
  @equal('type', 'DEMO') isDemo;
  @equal('type', 'PREVIEW') isPreview;
  @equal('type', 'SMART_PLACEMENT') isSmartPlacement;

  @equal('state', 'aborted') isAborted;
  @equal('state', 'completed') isCompleted;
  @equal('state', 'started') isStarted;

  @or('isCompetenceEvaluation', 'isSmartPlacement') hasCheckpoints;
  @or('isCompetenceEvaluation', 'isSmartPlacement') showLevelup;
  @or('isCompetenceEvaluation', 'isSmartPlacement', 'isDemo') showProgressBar;

  @computed('answers.[]')
  get answersSinceLastCheckpoints() {
    const answers = this.answers.toArray();
    const howManyAnswersSinceTheLastCheckpoint = answers.length % ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS;
    const sliceAnswersFrom = (howManyAnswersSinceTheLastCheckpoint === 0)
      ? -ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS
      : -howManyAnswersSinceTheLastCheckpoint;
    return answers.slice(sliceAnswersFrom);
  }

}
