import { hasMany, Model } from 'miragejs';

export default Model.extend({
  certificationIssueReports: hasMany('certification-issue-report'),
});
