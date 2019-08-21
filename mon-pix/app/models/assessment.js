import { equal, or } from '@ember/object/computed';
import { computed } from '@ember/object';
import DS from 'ember-data';
import ENV from 'mon-pix/config/environment';

const { attr, Model, belongsTo, hasMany } = DS;

export default Model.extend({

  // attributes
  codeCampaign: attr('string'),
  estimatedLevel: attr('number'),
  pixScore: attr('number'),
  state: attr('string'),
  title: attr('string'),
  type: attr('string'),
  certificationNumber: attr('string'),
  participantExternalId: attr('string'),

  // includes
  answers: hasMany('answer'),
  course: belongsTo('course', { inverse: null }),
  progression: belongsTo('progression', { inverse: null }),
  result: belongsTo('assessment-result'),

  // methods
  isCertification: equal('type', 'CERTIFICATION'),
  isCompetenceEvaluation: equal('type', 'COMPETENCE_EVALUATION'),
  isDemo: equal('type', 'DEMO'),
  isPreview: equal('type', 'PREVIEW'),
  isSmartPlacement: equal('type', 'SMART_PLACEMENT'),
  isStarted: equal('state', 'started'),
  isCompleted: equal('state', 'completed'),
  isAborted: equal('state', 'aborted'),

  showProgressBar: or('isCompetenceEvaluation', 'isSmartPlacement', 'isDemo', 'isCertification'),

  hasCheckpoints: or('isCompetenceEvaluation', 'isSmartPlacement'),

  answersSinceLastCheckpoints: computed('answers.[]', function() {
    const answers = this.answers.toArray();
    const howManyAnswersSinceTheLastCheckpoint = answers.length % ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS;
    const sliceAnswersFrom = (howManyAnswersSinceTheLastCheckpoint === 0)
      ? -ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS
      : -howManyAnswersSinceTheLastCheckpoint;
    return answers.slice(sliceAnswersFrom);
  })

});
