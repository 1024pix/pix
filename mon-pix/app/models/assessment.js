import { equal } from '@ember/object/computed';
import { computed } from '@ember/object';
import DS from 'ember-data';
import ENV from 'mon-pix/config/environment';

const { attr, Model, belongsTo, hasMany } = DS;

export default Model.extend({

  answers: hasMany('answer'),
  course: belongsTo('course', { inverse: null }),
  smartPlacementProgression: belongsTo('smart-placement-progression', { inverse: null }),
  certificationNumber: attr('string'),
  estimatedLevel: attr('number'),
  pixScore: attr('number'),
  result: belongsTo('assessment-result'),
  type: attr('string'),
  isCertification: equal('type', 'CERTIFICATION'),
  isCompetenceEvaluation: equal('type', 'COMPETENCE_EVALUATION'),
  isDemo: equal('type', 'DEMO'),
  isPreview: equal('type', 'PREVIEW'),
  isPlacement: equal('type', 'PLACEMENT'),
  isSmartPlacement: equal('type', 'SMART_PLACEMENT'),
  state: attr('string'),
  isStarted: equal('state', 'started'),
  isCompleted: equal('state', 'completed'),
  codeCampaign: attr('string'),
  participantExternalId: attr('string'),

  answersSinceLastCheckpoints: computed('answers.[]', function() {
    const answers = this.answers.toArray();
    const howManyAnswersSinceTheLastCheckpoint = answers.length % ENV.APP.NUMBER_OF_CHALLENGE_BETWEEN_TWO_CHECKPOINTS_IN_SMART_PLACEMENT;
    const sliceAnswersFrom = (howManyAnswersSinceTheLastCheckpoint === 0)
      ? -ENV.APP.NUMBER_OF_CHALLENGE_BETWEEN_TWO_CHECKPOINTS_IN_SMART_PLACEMENT
      : -howManyAnswersSinceTheLastCheckpoint;
    return answers.slice(sliceAnswersFrom);
  })

});
