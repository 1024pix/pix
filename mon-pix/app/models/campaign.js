import Model, { belongsTo, attr } from '@ember-data/model';

export default Model.extend({
  code: attr('string'),
  idPixLabel: attr('string'),
  title: attr('string'),
  organizationLogoUrl: attr('string'),
  organizationName: attr('string'),
  customLandingPageText: attr('string'),
  isRestricted: attr('boolean'),
  targetProfile: belongsTo('targetProfile'),
});
