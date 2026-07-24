import { hasMany, Model } from 'miragejs';

export default Model.extend({
  allowedCertificationCenterAccesses: hasMany('allowed-certification-center-access'),
  certificationCenterMemberships: hasMany('certification-center-membership'),
});
