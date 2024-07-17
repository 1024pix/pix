import ApplicationAdapter from './application';

export default class CoverRateAdapter extends ApplicationAdapter {
  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/organizations/${id}/cover-rate`;
  }
}
