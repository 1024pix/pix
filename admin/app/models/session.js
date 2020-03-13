import _ from 'lodash';
import DS from 'ember-data';
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';

const { attr, hasMany, Model } = DS;

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
  isFinalized: equal('status', FINALIZED),
  resultsSentToPrescriberAt: attr(),
  examinerGlobalComment: attr('string'),
  certifications: hasMany('certification'),

  hasExaminerGlobalComment : computed('examinerGlobalComment', function() {
    return this.examinerGlobalComment && this.examinerGlobalComment.trim().length > 0;
  }),

  isPublished: computed('certifications.[]', function() {
    return _.some(
      this.certifications.toArray(),
      (certif) => certif.isPublished
    );
  }),
  countExaminerComment : computed('certifications.[]', function() {
    const condition = (certif) => certif.examinerComment ? certif.examinerComment.trim().length > 0 : 0;
    return _getNumberOf(this.certifications, condition);
  }),
  countNotCheckedEndScreen : computed('certifications.[]', function() {
    return _getNumberOf(this.certifications, (certif) => !certif.hasSeenEndTestScreen);
  }),
  countNonValidatedCertifications : computed('certifications.[]', function() {
    return _getNumberOf(this.certifications, (certif) => certif.status !== 'validated');
  }),
  countPublishedCertifications : computed('certifications.[]', function() {
    return _getNumberOf(this.certifications, (certif) => certif.isPublished);
  }),

  displayResultsSentToPrescriberDate: computed('resultsSentToPrescriberAt', function() {
    return _formatHumanReadableLocaleDateTime(this.resultsSentToPrescriberAt);
  }),
  displayDate: computed('date', function() {
    return _formatHumanReadableLocaleDateTime(this.date);
  }),
  displayFinalizationDate: computed('finalizedAt', function() {
    return _formatHumanReadableLocaleDateTime(this.finalizedAt);
  }),

  displayStatus: computed('status', function() {
    return statusToDisplayName[this.status];
  }),
});

function _getNumberOf(certifications, booleanFct) {
  return _.sumBy(
    certifications.toArray(),
    (certif) => Number(booleanFct(certif))
  );
}

function _formatHumanReadableLocaleDateTime(date) {
  return date ? (new Date(date)).toLocaleString('fr-FR') : date;
}
