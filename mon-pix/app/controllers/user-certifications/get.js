import Controller from '@ember/controller';

export default class UserCertificationsController extends Controller {
  get shouldDisplayDetailsSection() {
    const model = this.model;
    return Boolean(model.commentForCandidate || model.hasAcquiredComplementaryCertifications);
  }
}
