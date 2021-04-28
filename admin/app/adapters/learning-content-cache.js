import ApplicationAdapter from './application';

export default class LearningContentCache extends ApplicationAdapter {

  refreshCacheEntries() {
    const url = `${this.host}/${this.namespace}/cache`;
    return this.ajax(url, 'PATCH');
  }

  createLearningContentReleaseAndRefreshCache() {
    const url = `${this.host}/${this.namespace}/lcms/releases`;
    return this.ajax(url, 'POST');
  }
}
