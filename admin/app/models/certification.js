/* eslint-disable ember/no-computed-properties-in-native-classes */

import { computed } from '@ember/object';
import Model, { attr, hasMany } from '@ember-data/model';

export const ACQUIRED = 'acquired';
export const REJECTED = 'rejected';
export const NOT_PASSED = 'not_passed';
export const partnerCertificationStatusToDisplayName = {
  [ACQUIRED]: 'Validée',
  [REJECTED]: 'Rejetée',
  [NOT_PASSED]: 'Non passée',
};
export const STARTED = 'started';
export const ERROR = 'error';
export const certificationStatuses = [
  { value: STARTED, label: 'Démarrée' },
  { value: ERROR, label: 'En erreur' },
  { value: 'validated', label: 'Validée' },
  { value: 'rejected', label: 'Rejetée' },
];

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
  @attr() cleaCertificationStatus;

  @hasMany('certification-issue-report') certificationIssueReports;

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
      result[value.competence_code] = { index: value.competence_code, level: value.level, score: value.score };
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

  @computed('cleaCertificationStatus')
  get displayCleaCertificationStatus() {
    return partnerCertificationStatusToDisplayName[this.cleaCertificationStatus];
  }

  @computed('cleaCertificationStatus')
  get isCleaCertificationIsAcquired() {
    return this.cleaCertificationStatus === ACQUIRED;
  }

  @computed('cleaCertificationStatus')
  get isCleaCertificationIsRejected() {
    return this.cleaCertificationStatus === REJECTED;
  }
}
