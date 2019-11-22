import DS from 'ember-data';
import { equal } from '@ember/object/computed';

export default DS.Model.extend({
  certificationCenter: DS.attr(),
  address: DS.attr(),
  room: DS.attr(),
  examiner: DS.attr(),
  date: DS.attr('date-only'),
  time: DS.attr(),
  description: DS.attr(),
  accessCode: DS.attr(),
  status: DS.attr(),
  isFinalized: equal('status', 'finalized'),
  certifications: DS.hasMany('certification'),
});
