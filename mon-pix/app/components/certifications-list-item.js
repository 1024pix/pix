import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';

const status = {
  VALIDATED: 'validated',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
};

export default class CertificationsListItem extends Component {
  @tracked
  isOpen = false;

  get certification() {
    return this.args.certification;
  }

  get isRejected() {
    return this.certification.status === status.REJECTED;
  }

  get isValidated() {
    return this.certification.status === status.VALIDATED;
  }

  get isNotPublished() {
    return !this.isPublished;
  }

  get isPublished() {
    return this.certification?.isPublished;
  }

  get isPublishedAndValidated() {
    return this.isPublished && this.isValidated;
  }

  get isCancelled() {
    return this.certification?.status === status.CANCELLED;
  }

  get shouldDisplayComment() {
    return this.isPublished && (this.isRejected || this.isCancelled) && this.certification?.commentForCandidate;
  }

  get isClickable() {
    return this.shouldDisplayComment || this.isPublishedAndValidated;
  }

  @action
  toggleCertificationDetails() {
    this.isOpen = !this.isOpen;
  }
}
