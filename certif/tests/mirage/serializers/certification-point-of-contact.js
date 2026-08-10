import ApplicationSerializer from './application';

const include = ['allowedCertificationCenterAccesses', 'certificationCenterMemberships'];

export default ApplicationSerializer.extend({
  include,
});
