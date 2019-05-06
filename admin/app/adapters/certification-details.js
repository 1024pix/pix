import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/admin/certifications/${id}/details`;
  }
});
