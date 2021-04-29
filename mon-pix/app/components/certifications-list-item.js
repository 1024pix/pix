import Component from '@glimmer/component';

const status = {
  VALIDATED: 'validated',
  CANCELLED: 'cancelled',
};

export default class CertificationsListItem extends Component {
  get isNotValidated() {
    return !this.isValidated;
  }

  get isValidated() {
    return this.args.certification.status === status.VALIDATED;
  }

  get isNotPublished() {
    return !this.isPublished;
  }

  get isPublished() {
    const { certification } = this.args;
    return certification?.isPublished;
  }

  get isCancelled() {
    const { certification } = this.args;
    return certification?.status === status.CANCELLED;
  }

  get isPublishedAndRejected() {
    return this.isPublished && this.isNotValidated;
  }

  get isPublishedAndValidated() {
    return this.isPublished && this.isValidated;
  }

  get shouldDisplayComment() {
    return (this.isPublishedAndRejected || this.isCancelled) && this.args.certification?.commentForCandidate;
  }

  get isClickable() {
    return this.shouldDisplayComment || this.isPublishedAndValidated;
  }
}
