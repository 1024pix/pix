import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  createRecord(type, accessCode) {

    const payload = {
      data: { attributes: { 'access-code': accessCode } }
    };

    const url = this.buildURL('courses-v2');
    return this.ajax(url, 'POST', { data: payload });
  }
});
