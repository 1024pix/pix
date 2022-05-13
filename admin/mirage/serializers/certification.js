import ApplicationSerializer from './application';

const include = [
  'certification-issue-reports',
  'common-complementary-certification-course-results',
  'complementary-certification-course-results-with-external',
];

export default ApplicationSerializer.extend({
  include,
  alwaysIncludeLinkageData: true,
});
