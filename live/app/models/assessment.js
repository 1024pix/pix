import DS from 'ember-data';

const { attr, Model, belongsTo, hasMany } = DS;
const { computed, isEqual } = Ember;

export default Model.extend({

  course: belongsTo('course', { inverse: null }),
  answers: hasMany('answer'),
  userId: attr('string'),
  userName: attr('string'),
  userEmail: attr('string'),

  numberOfValidatedAnswers: computed('answers', function () {
    return this
      .get('answers')
      .filter((answer) => answer.get('value') !== '#ABAND#')
      .get('length');
  }),

  firstChallenge: computed.alias('course.challenges.firstObject')

});
