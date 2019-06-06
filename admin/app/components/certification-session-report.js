/*
 * Important note:
 * this component will be removed when session report import is removed from admin
 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import _ from 'lodash';

export default Component.extend({

  // Element
  classNames: ['certification-session-report'],

  // Props
  displayCandidates: false,
  displayIncomplete: false,
  displayDuplicates: false,
  displayNotFromSession: false,
  displayWithoutCandidate: false,
  displayMissingEndScreen: false,
  displayComments: false,

  // CPs
  incomplete: computed('candidates', function() {
    return this.candidates.filter((candidate) => {
      return !candidate.lastName || candidate.lastName.trim() === ''
        || !candidate.firstName || candidate.firstName.trim() === ''
        || !candidate.birthDate || candidate.birthDate.trim() === ''
        || !candidate.birthPlace || candidate.birthPlace.trim() === ''
        || !candidate.certificationId || candidate.certificationId.toString().trim() === '';
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
      return candidate.certificationId && certificationIds.includes(candidate.certificationId.toString());
    });
  }),
  withoutCandidate:computed('candidates', function() {
    const candidateCertificationIds = this.candidates.map((candidate) => candidate.certificationId);
    return this.certifications.filter((certification) => {
      return candidateCertificationIds.indexOf(parseInt(certification.id)) === -1;
    });
  }),
  missingEndScreen: computed('candidates', function() {
    return _.filter(this.candidates, (candidate) => !candidate.lastScreen || candidate.lastScreen.trim() === '');
  }),
  comments: computed('candidates', function() {
    return _.filter(this.candidates, (candidate) => candidate.comments && candidate.comments.trim() !== '');
  }),
  actions: {
    toggleCandidates() {
      this.set('displayCandidates', !this.get('displayCandidates'));
    },
    toggleDuplicates() {
      this.set('displayDuplicates', !this.get('displayDuplicates'));
    },
    toggleNotFromSession() {
      this.set('displayNotFromSession', !this.get('displayNotFromSession'));
    },
    toggleWithoutCandidate() {
      this.set('displayWithoutCandidate', !this.get('displayWithoutCandidate'));
    },
    toggleMissingEndScreen() {
      this.set('displayMissingEndScreen', !this.get('displayMissingEndScreen'));
    },
    toggleComments() {
      this.set('displayComments', !this.get('displayComments'));
    },
    toggleIncomplete() {
      this.set('displayIncomplete', !this.get('displayIncomplete'));
    }
  }
});
