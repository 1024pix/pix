import DS from 'ember-data';
const { Model, attr } = DS;

export default Model.extend({
  firstName: attr('string'),
  lastName: attr('string'),
  email: attr('string'),
  password: attr('string'),
  cgu: attr('boolean'),
  recaptchaToken: attr('string')
});
