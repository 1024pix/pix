import DS from 'ember-data';

const { attr, Model, belongsTo, hasMany } = DS;

export default Model.extend({

  course: belongsTo('course', { inverse: null }),
  answers: hasMany('answer'),

  userName: attr('string'),
  userEmail: attr('string')

});
