import ApplicationAdapter from './application';

export default class CertificationCandidateForSupervisingAdapter extends ApplicationAdapter {

  buildURL(modelName, id, snapshot, requestType, query) {
    if (requestType === 'updateAuthorizedToStart') {
      return `${this.host}/${this.namespace}/certification-candidates/${id}/authorize-to-start`;
    }

    if (requestType === 'authorizeToResume') {
      return `${this.host}/${this.namespace}/certification-candidates/${id}/authorize-to-resume`;
    }

    return super.buildURL(modelName, id, snapshot, requestType, query);
  }
}
