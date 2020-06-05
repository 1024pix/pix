import ApplicationAdapter from './application';

export default class ProfileCopy extends ApplicationAdapter {

  copyProfile(data) {
    const url = `${this.host}/${this.namespace}/system/profile-copy`;
    return this.ajax(url, 'POST', { data: data });
  }
}
