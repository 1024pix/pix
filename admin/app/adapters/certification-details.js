import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  urlForFindRecord(id) {
    return `${this.host}/api/admin/certifications/${id}/details`;
  }
});
