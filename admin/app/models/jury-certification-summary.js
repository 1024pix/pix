import { computed } from '@ember/object';
import Model, { attr } from '@ember-data/model';

const ACQUIRED = 'acquired';
const REJECTED = 'rejected';
const NOT_PASSED = 'not_passed';

const partnerCertificationStatusToDisplayName = {
  [ACQUIRED]: 'Validée',
  [REJECTED]: 'Rejetée',
  [NOT_PASSED]: 'Non passée',
};

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
  @attr() numberOfCertificationIssueReports;

  @computed('createdAt')
  get creationDate() {
    return (new Date(this.createdAt)).toLocaleString('fr-FR');
  }

  @computed('completedAt')
  get completionDate() {
    return (new Date(this.completedAt)).toLocaleString('fr-FR');
  }

  @computed('cleaCertificationStatus')
  get cleaStatus() {
    return partnerCertificationStatusToDisplayName[this.cleaCertificationStatus];
  }
}
