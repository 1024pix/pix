import { equal } from '@ember/object/computed';
import { computed } from '@ember/object';
import DS from 'ember-data';
import ENV from 'mon-pix/config/environment';

const { attr, Model, belongsTo, hasMany } = DS;

export default Model.extend({

  answers: hasMany('answer'),
  course: belongsTo('course', { inverse: null }),
  skillReview: belongsTo('skill-review', { inverse: null }),
  certificationNumber: attr('string'),
  estimatedLevel: attr('number'),
  hasCheckpoints: equal('type', 'SMART_PLACEMENT'),
  isCertification: equal('type', 'CERTIFICATION'),
  pixScore: attr('number'),
  result: belongsTo('assessment-result'),
  type: attr('string'),
  codeCampaign: attr('string'),

  answersSinceLastCheckpoints: computed('answers.[]', function() {
    const answers = this.get('answers').toArray();
    const howManyAnswersSinceTheLastCheckpoint = answers.length % ENV.APP.NUMBER_OF_CHALLENGE_BETWEEN_TWO_CHECKPOINTS_IN_SMART_PLACEMENT;
    const sliceAnswersFrom = (howManyAnswersSinceTheLastCheckpoint === 0)
      ? -ENV.APP.NUMBER_OF_CHALLENGE_BETWEEN_TWO_CHECKPOINTS_IN_SMART_PLACEMENT
      : -howManyAnswersSinceTheLastCheckpoint;
    return answers.slice(sliceAnswersFrom);
  })

});
