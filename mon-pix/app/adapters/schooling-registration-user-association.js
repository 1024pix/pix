import classic from 'ember-classic-decorator';
import ApplicationAdapter from './application';

@classic
export default class SchoolingRegistrationUserAssociation extends ApplicationAdapter {
  urlForCreateRecord(modelName, { adapterOptions }) {
    const url = super.urlForCreateRecord(...arguments);

    if (adapterOptions && adapterOptions.searchForMatchingStudent) {
      return url + '/possibilities';
    }

    return url;
  }

  createRecord(store, type, snapshot) {
    const url = this.buildURL(type.modelName, null, snapshot, 'createRecord');
    const data = this.serialize(snapshot);

    if (snapshot.adapterOptions && snapshot.adapterOptions.searchForMatchingStudent) {
      delete snapshot.adapterOptions.searchForMatchingStudent;
      return this.ajax(url, 'PUT', { data });
    }

    if (snapshot.adapterOptions && snapshot.adapterOptions.tryReconciliation) {
      delete snapshot.adapterOptions.tryReconciliation;
      delete data.data.attributes['first-name'];
      delete data.data.attributes['last-name'];
    }

    delete data.data.attributes.username;

    return this.ajax(url, 'POST', { data });
  }
}

