import ApplicationSerializer from './application';

const include = ['certificationCandidates'];

export default ApplicationSerializer.extend({
  include,
});
