import ApplicationSerializer from './application';

const include = ['allowedCertificationCenterAccesses'];

export default ApplicationSerializer.extend({
  include,
});
