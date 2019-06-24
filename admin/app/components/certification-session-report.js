import Component from '@ember/component';
import { computed } from '@ember/object';
import _ from 'lodash';

export default Component.extend({

  // Element
  classNames: ['certification-session-report'],

  // Props
  candidates: null,

  // CPs
  incomplete: computed('candidates', function() {
    return this.candidates.filter((candidate) => {
      return !candidate.lastName || candidate.lastName.trim() === ''
        || !candidate.firstName || candidate.firstName.trim() === ''
        || !candidate.birthdate || candidate.birthdate.trim() === ''
        || !candidate.birthplace || candidate.birthplace.trim() === ''
        || !candidate.certificationId || candidate.certificationId.trim() === '';
    });
  }),

  duplicates: computed('candidates', function() {
    const certificationIds = _.map(this.candidates, 'certificationId');
    const groupedCertificationIds = _.groupBy(certificationIds, _.identity);
    return _.uniq(_.flatten(_.filter(groupedCertificationIds, (n) => n.length > 1)));
  }),

  notFromSession:computed('candidates', function() {
    const certificationIds = this.certifications.map((certification) => parseInt(certification.id));
    return this.candidates.filter((candidate) => {
      return certificationIds.indexOf(parseInt(candidate.certificationId)) === -1;
    });
  }),

  sessionCandidates: computed('candidates', function() {
    const certificationIds = this.certifications.map((certification) => certification.id);
    return _.filter(this.candidates, (candidate) => {
      return candidate.certificationId && certificationIds.includes(candidate.certificationId);
    });
  }),

  withoutCandidate:computed('candidates', function() {
    const candidateCertificationIds = this.candidates.map((candidate) => candidate.certificationId);
    return this.certifications.filter((certification) => {
      return candidateCertificationIds.indexOf(certification.id) === -1;
    });
  }),

  missingEndScreen: computed('candidates', function() {
    return _.filter(this.candidates, (candidate) => !candidate.lastScreen || candidate.lastScreen.trim() === '');
  }),

  comments: computed('candidates', function() {
    return _.filter(this.candidates, (candidate) => candidate.comments && candidate.comments.trim() !== '');
  }),

  // Actions

  actions: {
    toggleSection(sectionName) {
      this.toggleProperty(sectionName);
    }
  }
});
