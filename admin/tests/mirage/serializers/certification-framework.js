import ApplicationSerializer from './application';

const include = ['versionSummaries', 'targetProfileSummaries'];

export default ApplicationSerializer.extend({
  include,
  alwaysIncludeLinkageData: true,
});
