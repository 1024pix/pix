import DS from 'ember-data';
const { attr, hasMany, Model } = DS;
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import _ from 'lodash';

export default Model.extend({
  certificationCenter: attr(),
  address: attr(),
  room: attr(),
  examiner: attr(),
  date: attr('date-only'),
  time: attr(),
  description: attr(),
  accessCode: attr(),
  status: attr(),
  isFinalized: equal('status', 'finalized'),
  examinerComment: attr(),
  certifications: hasMany('certification'),
  countNonValidatedCertifications : computed('certifications.[]', function() {
    return _.reduce(this.certifications.toArray(), (count, certification) => {
      return certification.status !== 'validated' ? ++count : count;
    }, 0);
  }),
  hasExaminerComment : computed('examinerComment', function() {
    return this.examinerComment && this.examinerComment.trim().length > 0;
  }),
});
