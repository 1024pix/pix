import DS from 'ember-data';
const {Model, attr} = DS;

export default Model.extend({
  user_id: attr('string'),
  email: attr('string'),
  password: attr('string'),
  token: attr('string')
});
