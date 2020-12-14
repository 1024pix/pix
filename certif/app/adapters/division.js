import ApplicationAdapter from './application';

export default class DivisionAdapter extends ApplicationAdapter {

  urlForQuery(query) {
    const { certificationCenterId } = query;
    if (certificationCenterId) {
      delete query.certificationCenterId;
      return `${this.host}/${this.namespace}/certification-centers/${certificationCenterId}/divisions`;
    }
    return super.urlForQuery(...arguments);
  } 
}
