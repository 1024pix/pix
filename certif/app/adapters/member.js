import ApplicationAdapter from './application';

export default class MemberAdapter extends ApplicationAdapter {
  urlForQuery(query) {
    return `${this.host}/${this.namespace}/certification-centers/${query.certificationCenterId}/members`;
  }
}
