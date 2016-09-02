import DS from 'ember-data';

const { Model, belongsTo, hasMany } = DS;

export default Model.extend({

  course: belongsTo('course', { inverse: null }),
  answers: hasMany('answer')

});
