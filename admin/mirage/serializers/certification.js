import ApplicationSerializer from './application';

const include = [
  'certification-issue-reports',
  'common-complementary-certification-course-result',
  'complementary-certification-course-result-with-external',
];

export default ApplicationSerializer.extend({
  include,
  alwaysIncludeLinkageData: true,
});
