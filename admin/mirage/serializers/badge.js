import ApplicationSerializer from './application';

const include = ['badgeCriteria', 'badgePartnerCompetences'];

export default ApplicationSerializer.extend({
  include,
});
