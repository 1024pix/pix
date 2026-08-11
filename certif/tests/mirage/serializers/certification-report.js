import ApplicationSerializer from './application';

const include = ['certification-issue-reports'];

export default ApplicationSerializer.extend({
  include,
  alwaysIncludeLinkageData: true,
});
