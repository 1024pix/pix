import Component from '@ember/component';
import { computed } from '@ember/object';
import { filterBy, filter } from '@ember/object/computed';
import _ from 'lodash';

export default Component.extend({

  classNames: ['certification-session-report'],

  outOfSessionCertifications: filterBy('certifications', 'isInSession', false),

  incompleteCertifications: filter('certifications', function(certification) {
    return !certification.lastName
      ||   !certification.firstName
      ||   !certification.birthdate
      ||   !certification.birthplace
      ||   !certification.id;
  }),

  duplicateCertificationIds: computed('certifications', function() {
    const certificationsGroupedByCertifId = _.groupBy(this.certifications, (certification) => {
      return certification.id;
    });
    return _.compact(_.map(certificationsGroupedByCertifId, (certifications, certificationId) => {
      if (certifications.length > 1) {
        return certificationId;
      }
    }));
  }),

  noLastScreenSeenFromPaperReport: filterBy('certifications', 'hasSeenLastScreenFromPaperReport', false),

  commentedByExaminerCertifications: filter('certifications', function(certification) {
    return !_.isEmpty(certification.examinerComment);
  }),

  actions: {
    toggleSection(sectionName) {
      this.toggleProperty(sectionName);
    }
  }
});
