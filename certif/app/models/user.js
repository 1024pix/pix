import Model, { attr, hasMany } from '@ember-data/model';

export default class User extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') email;
  @attr('boolean') pixCertifTermsOfServiceAccepted;
  @hasMany('certificationCenterMembership') certificationCenterMemberships;
}
