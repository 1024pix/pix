import ApplicationAdapter from './application';

export default class InfoChallengeAdapter extends ApplicationAdapter {
  urlForFindRecord(id) {
    return `${this.host}/${this.namespace}/godmode/info-challenges/${id}`;
  }
}
