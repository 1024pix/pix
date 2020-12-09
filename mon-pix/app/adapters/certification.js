import ApplicationAdapter from './application';

export default class Certification extends ApplicationAdapter {

  queryRecord(store, type, query) {
    if (query.verificationCode) {
      const url = `${this.host}/${this.namespace}/shared-certifications`;
      return this.ajax(url, 'POST', { data: { verificationCode: query.verificationCode } });
    }

    return super.queryRecord(...arguments);
  }
}
