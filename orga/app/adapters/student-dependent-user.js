import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  urlForCreateRecord() {
    return `${this.host}/${this.namespace}/student-dependent-users/password-update`;
  },

});
