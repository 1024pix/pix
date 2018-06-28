import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  urlForFindRecord (id) {
    return this.host + '/admin/certifications/'+id+'/details';
  }
});
