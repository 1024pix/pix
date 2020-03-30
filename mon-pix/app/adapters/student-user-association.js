import classic from 'ember-classic-decorator';
import ApplicationAdapter from './application';

@classic
export default class StudentUserAssociation extends ApplicationAdapter {
  urlForCreateRecord(modelName, { adapterOptions }) {
    const url = super.urlForCreateRecord(...arguments);

    if (adapterOptions && adapterOptions.searchForMatchingStudent) {
      delete adapterOptions.searchForMatchingStudent;
      return url + '/possibilities';
    }

    return url;
  }

  createRecord(store, type, snapshot) {
    if (snapshot.adapterOptions && snapshot.adapterOptions.searchForMatchingStudent) {
      const url = this.buildURL(type.modelName, null, snapshot, 'createRecord');
      const data = this.serialize(snapshot);
      return this.ajax(url, 'PUT', { data });
    }
    return super.createRecord(...arguments);
  }
}

