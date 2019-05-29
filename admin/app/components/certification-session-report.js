/*
 * Important note:
 * this component will be removed when session report import is removed from admin
 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import DS from 'ember-data';
import _ from 'lodash';

export default Component.extend({

  classNames: ['certification-session-report'],

  displayCandidates:false,
  displayIncomplete:false,
  displayDuplicates:false,
  displayNotFromSession:false,
  displayWithoutCandidate:false,
  displayMissingEndScreen:false,
  displayComments:false,
  incomplete:computed('candidates', function() {
    return this.get('candidates').filter((candidate) => {
      return candidate.lastName == null
      || candidate.lastName === ''
      || candidate.firstName == null
      || candidate.firstName === ''
      || candidate.birthDate == null
      || candidate.birthDate === ''
      || candidate.birthPlace == null
      || candidate.birthPlace === ''
      || candidate.certificationId == null
      || candidate.certficiationId === '';
    });
  }),
  duplicates:computed('candidates', function() {
    const certificationIds = _.map(this.candidates, 'certificationId');
    const grouppedCertificationIds = _.groupBy(certificationIds, _.identity);
    const duplicateCertificationIds = _.uniq(_.flatten(_.filter(grouppedCertificationIds, (n) => n.length > 1)));
    return duplicateCertificationIds;
  }),
  notFromSession:computed(function() {
    const certificationIds = this.certifications.map((certification) => certification.id);
    return this.candidates.filter((candidate) => {
      return certificationIds.indexOf(parseInt(candidate.certificationId)) === -1;
    });
  }),
  sessionCandidates:computed('candidates', 'notFromSession', function() {
    return DS.PromiseArray.create({
      promise: this.get('notFromSession')
        .then((toBeExcluded) => {
          const excludeIds = toBeExcluded.reduce((ids, candidate) => {
            ids.push(candidate.certificationId);
            return ids;
          }, []);
          return this.get('candidates').filter((candidate) => {
            return excludeIds.indexOf(candidate.certificationId) === -1;
          });
        })
    });
  }),
  withoutCandidate:computed(function() {
    const candidateIds = this.candidates.map((candidate) => candidate.certificationId);
    return this.certifications.filter((certification) => {
      return candidateIds.indexOf(parseInt(certification.id)) === -1;
    });
  }),
  missingEndScreen:computed('candidates', function() {
    return this.get('candidates').filter((candidate) => {
      return candidate.lastScreen == null;
    });
  }),
  comments:computed('candidates', function() {
    return this.get('candidates').filter((candidate) => {
      return candidate.comments != null;
    });
  }),
  actions:{
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
      this.set('displayWithoutCandidate',  !this.get('displayWithoutCandidate'));
    },
    toggleMissingEndScreen() {
      this.set('displayMissingEndScreen',  !this.get('displayMissingEndScreen'));
    },
    toggleComments() {
      this.set('displayComments',  !this.get('displayComments'));
    },
    toggleIncomplete() {
      this.set('displayIncomplete',  !this.get('displayIncomplete'));
    }
  }
});
