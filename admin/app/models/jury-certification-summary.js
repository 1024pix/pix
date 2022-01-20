// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';
import Model, { attr } from '@ember-data/model';
import find from 'lodash/find';
import { certificationStatuses } from 'pix-admin/models/certification';

const NOT_TAKEN = 'not_taken';
export const ENDED_BY_SUPERVISOR = 'endedBySupervisor';
export const juryCertificationSummaryStatuses = [{ value: ENDED_BY_SUPERVISOR, label: 'Terminée par le surveillant' }];

const statuses = [...certificationStatuses, ...juryCertificationSummaryStatuses];
export default class JuryCertificationSummary extends Model {
  @attr() firstName;
  @attr() lastName;
  @attr() status;
  @attr() pixScore;
  @attr() createdAt;
  @attr() completedAt;
  @attr() isPublished;
  @attr() examinerComment;
  @attr() hasSeenEndTestScreen;
  @attr() cleaCertificationStatus;
  @attr() pixPlusDroitMaitreCertificationStatus;
  @attr() pixPlusDroitExpertCertificationStatus;
  @attr() pixPlusEduAutonomeCertificationStatus;
  @attr() pixPlusEduInitieCertificationStatus;
  @attr() pixPlusEduExpertCertificationStatus;
  @attr() pixPlusEduFormateurCertificationStatus;
  @attr() numberOfCertificationIssueReports;
  @attr() isFlaggedAborted;
  @attr() numberOfCertificationIssueReportsWithRequiredAction;

  @computed('createdAt')
  get creationDate() {
    return new Date(this.createdAt).toLocaleString('fr-FR');
  }

  @computed('completedAt')
  get completionDate() {
    return this.completedAt ? new Date(this.completedAt).toLocaleString('fr-FR') : null;
  }

  get complementaryCertificationsLabel() {
    const certifications = [];
    if (this.cleaCertificationStatus !== NOT_TAKEN) certifications.push('CléA Numérique');
    if (this.pixPlusDroitMaitreCertificationStatus !== NOT_TAKEN) certifications.push('Pix+ Droit Maître');
    if (this.pixPlusDroitExpertCertificationStatus !== NOT_TAKEN) certifications.push('Pix+ Droit Expert');
    if (this.pixPlusEduAutonomeCertificationStatus !== NOT_TAKEN) certifications.push('Pix+ Édu Autonome');
    if (this.pixPlusEduInitieCertificationStatus !== NOT_TAKEN) certifications.push('Pix+ Édu Initié');
    if (this.pixPlusEduExpertCertificationStatus !== NOT_TAKEN) certifications.push('Pix+ Édu Expert');
    if (this.pixPlusEduFormateurCertificationStatus !== NOT_TAKEN) certifications.push('Pix+ Édu Formateur');
    return certifications.join('\n');
  }

  @computed('numberOfCertificationIssueReportsWithRequiredAction')
  get numberOfCertificationIssueReportsWithRequiredActionLabel() {
    return this.numberOfCertificationIssueReportsWithRequiredAction > 0
      ? this.numberOfCertificationIssueReportsWithRequiredAction
      : '';
  }

  @computed('hasSeenEndTestScreen')
  get hasSeenEndTestScreenLabel() {
    return this.hasSeenEndTestScreen ? '' : 'non';
  }

  @computed('status')
  get statusLabel() {
    const statusWithLabel = find(statuses, { value: this.status });
    return statusWithLabel?.label;
  }

  @computed('status')
  get isCertificationStarted() {
    return this.status === 'started';
  }

  @computed('status')
  get isCertificationInError() {
    return this.status === 'error';
  }
}
