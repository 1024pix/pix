import Component from '@glimmer/component';

export default class CertificationsListItem extends Component {
  get isNotValidated() {
    return !this.isValidated;
  }

  get isValidated() {
    return this.args.certification.status === 'validated';
  }

  get isNotPublished() {
    return !this.isPublished;
  }

  get isPublished() {
    const certification = this.args.certification;
    return certification && certification.isPublished;
  }

  get isPublishedAndRejected() {
    return this.isPublished && this.isNotValidated;
  }

  get isPublishedAndValidated() {
    return this.isPublished && this.isValidated;
  }

  get shouldDisplayComment() {
    return this.isPublishedAndRejected && this.args.certification.commentForCandidate;
  }

  get isClickable() {
    return this.shouldDisplayComment || this.isPublishedAndValidated;
  }
}
