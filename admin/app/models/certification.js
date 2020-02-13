import DS from 'ember-data';
const { attr, Model } = DS;
import { computed } from '@ember/object';
import _ from 'lodash';

export default Model.extend({
  sessionId: attr(),
  assessmentId: attr(),
  firstName: attr(),
  lastName: attr(),
  birthdate: attr('date-only'),
  birthplace: attr(),
  externalId: attr(),
  createdAt: attr(),
  completedAt: attr(),
  status: attr(),
  juryId: attr(),
  hasSeenLastScreenFromPaperReport: attr('boolean', { defaultValue: true }),
  hasSeenEndTestScreen: attr('boolean'),
  examinerComment: attr('string'),
  commentForCandidate: attr(),
  commentForOrganization: attr(),
  commentForJury: attr(),
  pixScore: attr(),
  competencesWithMark: attr(),
  isPublished: attr('boolean', { defaultValue: false }),
  isV2Certification: attr('boolean', { defaultValue: false }),
  creationDate: computed('createdAt', function() {
    return (new Date(this.createdAt)).toLocaleString('fr-FR');
  }),
  completionDate: computed('completedAt', function() {
    return (new Date(this.completedAt)).toLocaleString('fr-FR');
  }),
  publishedText: computed('isPublished', function() {
    const value = this.isPublished;
    return value ? 'Oui' : 'Non';
  }),
  isV2CertificationText: computed('isV2Certification', function() {
    const value = this.isV2Certification;
    return value ? 'Oui' : 'Non';
  }),
  indexedCompetences: computed('competencesWithMark', function() {
    const competencesWithMarks = this.competencesWithMark;
    return competencesWithMarks.reduce((result, value) => {
      result[value['competence-code']] = { index: value['competence-code'], level: value.level, score: value.score };
      return result;
    }, {});
  }),
  competences: computed('indexedCompetences', function() {
    const indexedCompetences = this.indexedCompetences;
    return Object.keys(indexedCompetences).sort().reduce((result, value) => {
      result.push(indexedCompetences[value]);
      return result;
    }, []);
  }),

  updateUsingCertificationInReport: function(certificationInReport) {
    _.each(['firstName', 'lastName', 'birthdate', 'birthplace', 'externalId', 'examinerComment'], (attribute) => {
      if (_.isEmpty(this.get(attribute)) && !_.isEmpty(certificationInReport[attribute])) {
        this.set(attribute, certificationInReport[attribute].trim());
      }
    });

    this.set('hasSeenLastScreenFromPaperReport', this.hasSeenLastScreenFromPaperReport && certificationInReport.hasSeenLastScreenFromPaperReport);
  },
});
