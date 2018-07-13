import DS from 'ember-data';

const { Model, attr, hasMany } = DS;

export default Model.extend({

  solution: attr('string'),
  hint: attr('string'),
  tutorials: hasMany('tutorial', { inverse: null }),
  learningMoreTutorials: hasMany('tutorial', { inverse: null }),

});
