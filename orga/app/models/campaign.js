import DS from 'ember-data';
import { computed } from '@ember/object';
import ENV from 'pix-orga/config/environment';

export default DS.Model.extend({
  name: DS.attr('string'),
  code: DS.attr('string'),
  organizationId: DS.attr('number'),
  organization: DS.belongsTo('organization'),

  url: computed('code', function() {
    let code = this.get('code');
    return `${ENV.APP.CAMPAIGNS_ROOT_URL}${code}`;
  })
});
