import Model, { belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';

export default Model.extend({
  code: attr('string'),
  idPixLabel: attr('string'),
  title: attr('string'),
  archivedAt: attr('date'),
  organizationLogoUrl: attr('string'),
  organizationName: attr('string'),
  customLandingPageText: attr('string'),
  isRestricted: attr('boolean'),
  targetProfile: belongsTo('targetProfile'),

  isArchived: computed('archivedAt', function() {
    return Boolean(this.archivedAt);
  }),
});
