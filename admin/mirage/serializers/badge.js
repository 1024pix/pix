import ApplicationSerializer from './application';

const include = ['badgeCriteria', 'skillSets'];

export default ApplicationSerializer.extend({
  include,
});
