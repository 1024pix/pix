import DS from 'ember-data';
import { equal } from '@ember/object/computed';

export default DS.Model.extend({
  organizationId: DS.attr('string'),
  email: DS.attr('string'),
  status: DS.attr('string'),

  isPending: equal('status', 'PENDING'),
  isAccepted: equal('status', 'ACCEPTED'),
});
