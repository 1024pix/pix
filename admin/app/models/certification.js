import { computed } from '@ember/object';
import Model, { attr } from '@ember-data/model';
import _ from 'lodash';

export default class Certification extends Model {

  @attr() sessionId;
  @attr() assessmentId;
  @attr() firstName;
  @attr() lastName;
  @attr('date-only') birthdate;
  @attr() birthplace;
  @attr() externalId;
  @attr() createdAt;
  @attr() completedAt;
  @attr() status;
  @attr() juryId;
  @attr('boolean') hasSeenEndTestScreen;
  @attr('string') examinerComment;
  @attr('string') commentForCandidate;
  @attr('string') commentForOrganization;
  @attr('string') commentForJury;
  @attr() pixScore;
  @attr() competencesWithMark;
  @attr('boolean', { defaultValue: false }) isPublished;
  @attr('boolean', { defaultValue: false }) isV2Certification;

  @computed('createdAt')
  get creationDate() {
    return (new Date(this.createdAt)).toLocaleString('fr-FR');
  }

  @computed('completedAt')
  get completionDate() {
    return (new Date(this.completedAt)).toLocaleString('fr-FR');
  }

  @computed('isPublished')
  get publishedText() {
    const value = this.isPublished;
    return value ? 'Oui' : 'Non';
  }

  @computed('isV2Certification')
  get isV2CertificationText() {
    const value = this.isV2Certification;
    return value ? 'Oui' : 'Non';
  }

  @computed('competencesWithMark')
  get indexedCompetences() {
    const competencesWithMarks = this.competencesWithMark;
    return competencesWithMarks.reduce((result, value) => {
      result[value['competence-code']] = { index: value['competence-code'], level: value.level, score: value.score };
      return result;
    }, {});
  }

  @computed('indexedCompetences')
  get competences() {
    const indexedCompetences = this.indexedCompetences;
    return Object.keys(indexedCompetences).sort().reduce((result, value) => {
      result.push(indexedCompetences[value]);
      return result;
    }, []);
  }

  updateUsingCertificationInReport(certificationInReport) {
    _.each(['firstName', 'lastName', 'birthdate', 'birthplace', 'externalId', 'examinerComment'], (attribute) => {
      if (_.isEmpty(this.get(attribute)) && !_.isEmpty(certificationInReport[attribute])) {
        this.set(attribute, certificationInReport[attribute].trim());
      }
    });

    this.set('hasSeenEndTestScreen', certificationInReport.hasSeenEndTestScreen);
  }
}
