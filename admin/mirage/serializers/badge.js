import ApplicationSerializer from './application';

const include = ['badgeCriteria'];

export default ApplicationSerializer.extend({
  include,
});
