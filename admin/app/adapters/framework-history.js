import ApplicationAdapter from './application';

export default class FrameworkHistoryAdapter extends ApplicationAdapter {
  queryRecord(store, type, scope) {
    const url = `${this.host}/${this.namespace}/certification-frameworks/${scope}/framework-history`;
    return this.ajax(url, 'GET');
  }
}
