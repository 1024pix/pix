import ApplicationAdapter from './application';

export default class User extends ApplicationAdapter {
  urlForQueryRecord(query) {
    if (query.me) {
      delete query.me;
      return `${super.urlForQueryRecord(...arguments)}/me`;
    }

    return super.urlForQueryRecord(...arguments);
  }

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = super.urlForUpdateRecord(...arguments);

    if (adapterOptions && adapterOptions.acceptPixOrgaTermsOfService) {
      delete adapterOptions.acceptPixOrgaTermsOfService;
      return url + '/pix-orga-terms-of-service-acceptance';
    }

    return url;
  }
}
