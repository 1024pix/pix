import ApplicationAdapter from './application';

export default class FlashAlgorithmConfigurationAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  queryRecord() {
    const url = `${this.host}/${this.namespace}/flash-assessment-configuration`;
    return this.ajax(url, 'GET');
  }
}
