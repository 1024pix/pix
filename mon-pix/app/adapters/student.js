import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  urlForQueryRecord(query) {
    const url = `${this.host}/${this.namespace}/users/${query.userId}/student`;
    delete query.userId;
    return url;
  },
});
