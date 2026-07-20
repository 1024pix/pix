import ApplicationSerializer from './application';

const include = ['badgeSummaries'];

export default ApplicationSerializer.extend({
  include,
  alwaysIncludeLinkageData: true,
});
