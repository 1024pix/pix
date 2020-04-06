import classic from 'ember-classic-decorator';
import ApplicationAdapter from './application';

@classic
export default class Correction extends ApplicationAdapter {
  // refresh cache
  refreshRecord(type, challenge) {
    const url = `${this.host}/${this.namespace}/cache/Epreuves_${challenge.challengeId}`;
    return this.ajax(url, 'DELETE');
  }
}
