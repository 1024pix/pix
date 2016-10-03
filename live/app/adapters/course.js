import AirtableAdapter from "./airtable";

export default AirtableAdapter.extend({

  pathForType: () => 'Tests',

  urlForFindAll() {
    const url = this._super(...arguments);
    return `${url}?view=${encodeURIComponent('PIX view')}`;
  }
});
