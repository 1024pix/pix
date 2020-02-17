import DS from 'ember-data';
const { attr, hasMany, Model } = DS;
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';
import _ from 'lodash';

export const CREATED = 'created';
export const FINALIZED = 'finalized';
export const statusToDisplayName = {
  [CREATED]: 'Créée',
  [FINALIZED]: 'Finalisée',
};

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
  finalizedAt: attr(),
  isFinalized: equal('status', 'finalized'),
  examinerGlobalComment: attr('string'),
  certifications: hasMany('certification'),
  countExaminerComment : computed('certifications.[]', function() {
    return _.sumBy(
      this.certifications.toArray(),
      (certif) => certif.examinerComment ? Number(certif.examinerComment.trim().length > 0) : 0
    );
  }),
  countNotCheckedEndScreen : computed('certifications.[]', function() {
    return _.sumBy(
      this.certifications.toArray(),
      (certif) => Number(!certif.hasSeenEndTestScreen)
    );
  }),
  countNonValidatedCertifications : computed('certifications.[]', function() {
    return _.sumBy(
      this.certifications.toArray(),
      (certif) => Number(certif.status !== 'validated')
    );
  }),
  hasExaminerGlobalComment : computed('examinerGlobalComment', function() {
    return this.examinerGlobalComment && this.examinerGlobalComment.trim().length > 0;
  }),

  finalizationDate: computed('finalizedAt', function() {
    return (new Date(this.finalizedAt)).toLocaleString('fr-FR');
  }),
});
