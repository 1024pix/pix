import ApplicationAdapter from './application';

export default class LearningContentCache extends ApplicationAdapter {

  refreshCacheEntries() {
    const url = `${this.host}/${this.namespace}/cache`;
    return this.ajax(url, 'PATCH');
  }
}
