import ApplicationAdapter from './application';

export default class CertificationPointOfContactAdapter extends ApplicationAdapter {

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = super.urlForUpdateRecord(...arguments);

    if (adapterOptions && adapterOptions.acceptPixCertifTermsOfService) {
      delete adapterOptions.acceptPixCertifTermsOfService;
      return `${this.host}/${this.namespace}/users/${id}/pix-certif-terms-of-service-acceptance`;
    }

    return url;
  }
}
