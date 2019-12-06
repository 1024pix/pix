import DS from 'ember-data';
import { computed } from '@ember/object';
import _ from 'lodash';

export default DS.Model.extend({
  sessionId: DS.attr(),
  assessmentId: DS.attr(),
  firstName: DS.attr(),
  lastName: DS.attr(),
  birthdate: DS.attr('date-only'),
  birthplace: DS.attr(),
  externalId: DS.attr(),
  createdAt: DS.attr(),
  completedAt: DS.attr(),
  status: DS.attr(),
  juryId: DS.attr(),
  hasSeenLastScreen: DS.attr('boolean', { defaultValue: true }),
  examinerComment: DS.attr('string'),
  commentForCandidate: DS.attr(),
  commentForOrganization: DS.attr(),
  commentForJury: DS.attr(),
  pixScore: DS.attr(),
  competencesWithMark: DS.attr(),
  isPublished: DS.attr('boolean', { defaultValue: false }),
  isV2Certification: DS.attr('boolean', { defaultValue: false }),

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

    this.set('hasSeenLastScreen', this.hasSeenLastScreen && certificationInReport.hasSeenLastScreen);
  },
});
