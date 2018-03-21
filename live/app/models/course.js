import DS from 'ember-data';

const { Model, attr } = DS;

export default Model.extend({

  name: attr('string'),
  description: attr('string'),
  duration: attr('number'),
  imageUrl: attr('string'),
  isAdaptive: attr('boolean'),
  nbChallenges: attr('number'),
  type: attr('string'),
  accessCode : attr('string')

});
