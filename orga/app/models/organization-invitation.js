import DS from 'ember-data';
import { equal } from '@ember/object/computed';

export default DS.Model.extend({
  email: DS.attr('string'),
  status: DS.attr('string'),
  createdAt: DS.attr('date'),

  organization: DS.belongsTo('organization'),

  isPending: equal('status', 'PENDING'),
  isAccepted: equal('status', 'ACCEPTED'),
});
