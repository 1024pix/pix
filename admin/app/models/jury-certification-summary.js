/* eslint-disable ember/no-computed-properties-in-native-classes */

import { computed } from '@ember/object';
import Model, { attr } from '@ember-data/model';
import find from 'lodash/find';
import { certificationStatuses } from 'pix-admin/models/certification';

const NOT_TAKEN = 'not_taken';

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
  @attr() numberOfCertificationIssueReports;
  @attr() numberOfCertificationIssueReportsWithRequiredAction;

  @computed('createdAt')
  get creationDate() {
    return (new Date(this.createdAt)).toLocaleString('fr-FR');
  }

  @computed('completedAt')
  get completionDate() {
    return (new Date(this.completedAt)).toLocaleString('fr-FR');
  }

  get complementaryCertificationsLabel() {
    const certifications = [];
    if (this.cleaCertificationStatus !== NOT_TAKEN) certifications.push('CléA Numérique');
    if (this.pixPlusDroitMaitreCertificationStatus !== NOT_TAKEN) certifications.push('Pix+ Droit Maître');
    if (this.pixPlusDroitExpertCertificationStatus !== NOT_TAKEN) certifications.push('Pix+ Droit Expert');
    return certifications.join('\n');
  }

  @computed('numberOfCertificationIssueReportsWithRequiredAction')
  get numberOfCertificationIssueReportsWithRequiredActionLabel() {
    return this.numberOfCertificationIssueReportsWithRequiredAction > 0 ? this.numberOfCertificationIssueReportsWithRequiredAction : '';
  }

  @computed('hasSeenEndTestScreen')
  get hasSeenEndTestScreenLabel() {
    return this.hasSeenEndTestScreen ? '' : 'non';
  }

  @computed('status')
  get statusLabel() {
    const statusWithLabel = find(certificationStatuses, (certificationStatus) => certificationStatus.value === this.status);
    return statusWithLabel?.label;
  }
}
