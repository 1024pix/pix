import DS from 'ember-data';
import { computed } from '@ember/object';

export default DS.Model.extend({
  sessionId: DS.attr(),
  certificationId: DS.attr(),
  assessmentId: DS.attr(),
  firstName: DS.attr(),
  lastName: DS.attr(),
  birthdate: DS.attr(),
  birthplace: DS.attr(),
  externalId: DS.attr(),
  createdAt: DS.attr(),
  completedAt: DS.attr(),
  creationDate:computed('createdAt', function() {
    return (new Date(this.createdAt)).toLocaleString('fr-FR');
  }),
  completionDate:computed('completedAt', function() {
    return (new Date(this.completedAt)).toLocaleString('fr-FR');
  }),
  resultsCreationDate:computed('resultCreatedAt', function() {
  }),
  status: DS.attr(),
  juryId: DS.attr(),
  commentForCandidate: DS.attr(),
  commentForOrganization: DS.attr(),
  commentForJury: DS.attr(),
  pixScore: DS.attr(),
  competencesWithMark: DS.attr(),
  isPublished: DS.attr('boolean', { defaultValue: false }),
  publishedText:computed('isPublished', function() {
    let value = this.isPublished;
    return value?'Oui':'Non';
  }),
  indexedCompetences:computed('competencesWithMark', function() {
    let competencesWithMarks = this.competencesWithMark;
    return competencesWithMarks.reduce((result, value) => {
      result[value['competence-code']] = {index:value['competence-code'], level:value.level, score:value.score};
      return result;
    }, {});
  }),
  competences:computed('indexedCompetences', function() {
    let indexedCompetences = this.indexedCompetences;
    return Object.keys(indexedCompetences).sort().reduce((result, value) => {
      result.push(indexedCompetences[value]);
      return result;
    },[]);
  })
});
