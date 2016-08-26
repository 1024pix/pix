import DS from 'ember-data';

const { Model, belongsTo } = DS;

export default Model.extend({

  course: belongsTo('course', { inverse: null })

});
