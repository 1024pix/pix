import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  urlForQueryRecord(query) {
    if (query.me) {
      delete query.me;
      return `${this._super(...arguments)}/me`;
    }

    return this._super(...arguments);
  },

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = this._super(...arguments);

    if (adapterOptions && adapterOptions.acceptPixOrgaTermsOfService) {
      delete adapterOptions.acceptPixOrgaTermsOfService;
      return url + '/accept-pix-orga-terms-of-service';
    }

    return url;
  },
});
