import ApplicationAdapter from './application';

export default class UserAdapter extends ApplicationAdapter {

  urlForQueryRecord(query) {
    if (query.me) {
      delete query.me;
      return `${super.urlForQueryRecord(...arguments)}/me`;
    }

    return super.urlForQueryRecord(...arguments);
  }

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = super.urlForUpdateRecord(...arguments);

    if (adapterOptions && adapterOptions.acceptPixCertifTermsOfService) {
      delete adapterOptions.acceptPixCertifTermsOfService;
      return url + '/pix-certif-terms-of-service-acceptance';
    }

    return url;
  }
}
