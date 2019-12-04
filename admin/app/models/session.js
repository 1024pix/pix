import DS from 'ember-data';
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import _ from 'lodash';

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
  countNonValidatedCertifications : computed('certifications.[]', function() {
    return _.reduce(this.certifications.toArray(), (count, certification) => {
      return certification.status !== 'validated' ? ++count : count;
    }, 0);
  }),
});
