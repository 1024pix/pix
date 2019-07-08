import DS from 'ember-data';
import { equal } from '@ember/object/computed';

export default DS.Model.extend({
  user: DS.belongsTo('user'),
  organization: DS.belongsTo('organization'),
  organizationRole: DS.attr('string'),

  isOwner: equal('organizationRole', 'OWNER'),
});
