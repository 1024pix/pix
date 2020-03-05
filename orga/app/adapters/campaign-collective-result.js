import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  urlForQueryRecord(query) {
    if (query.filter.campaignId) {
      const { campaignId, view } = query.filter;
      delete query.filter;

      return `${this.host}/${this.namespace}/campaigns/${campaignId}/collective-results?view=${view}`;
    }
    return this._super(...arguments);
  },
});
