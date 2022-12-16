import Controller from '@ember/controller';

export default class SharedCertificationController extends Controller {
  get shouldDisplayDetailsSection() {
    const model = this.model;
    return Boolean(model.commentForCandidate || model.hasAcquiredComplementaryCertifications);
  }
}
