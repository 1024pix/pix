import DS from 'ember-data';

const { Model, attr, hasMany, } = DS;

export default class User extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') email;
  @attr('boolean') pixCertifTermsOfServiceAccepted;
  @hasMany('certificationCenterMembership') certificationCenterMemberships;
}
