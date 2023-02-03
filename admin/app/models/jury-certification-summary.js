// eslint-disable-next-line ember/no-computed-properties-in-native-classes
import { computed } from '@ember/object';
import Model, { attr } from '@ember-data/model';
import find from 'lodash/find';
import { certificationStatuses } from './certification';
import dayjs from 'dayjs';

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
  @attr() isCancelled;
  @attr() examinerComment;
  @attr() hasSeenEndTestScreen;
  @attr() complementaryCertificationTakenLabels;
  @attr() numberOfCertificationIssueReports;
  @attr() isFlaggedAborted;
  @attr() numberOfCertificationIssueReportsWithRequiredAction;

  @computed('createdAt')
  get creationDate() {
    return dayjs(this.createdAt).format('DD/MM/YYYY, HH:mm:ss');
  }

  @computed('completedAt')
  get completionDate() {
    return this.completedAt ? dayjs(this.completedAt).format('DD/MM/YYYY, HH:mm:ss') : null;
  }

  get complementaryCertificationsLabel() {
    return this.complementaryCertificationTakenLabels?.join('\n') ?? '';
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

  @computed('status', 'isCancelled')
  get statusLabel() {
    if (this.isCancelled) return 'Annulée';
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
