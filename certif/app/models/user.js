import Model, { attr, hasMany } from '@ember-data/model';

export default Model.extend({
  email: attr(),
  firstName: attr(),
  lastName: attr(),
  pixCertifTermsOfServiceAccepted: attr(),
  certificationCenterMemberships: hasMany('certificationCenterMembership')
});
