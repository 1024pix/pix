import DS from 'ember-data';
import { notEmpty } from '@ember/object/computed';

export default DS.Model.extend({
  lastName: DS.attr('string'),
  firstName: DS.attr('string'),
  birthdate: DS.attr('date-only'),
  organization: DS.belongsTo('organization'),
  username: DS.attr('string'),

  hasUsername: notEmpty('username'),
});
