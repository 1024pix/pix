import ApplicationAdapter from './application';

export default class FrameworkAdapter extends ApplicationAdapter {
  urlForQuery() {
    return `${this.host}/${this.namespace}/frameworks/for-target-profile-submission`;
  }
}
