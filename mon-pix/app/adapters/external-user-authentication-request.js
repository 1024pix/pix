import classic from 'ember-classic-decorator';
import ApplicationAdapter from './application';

@classic
export default class ExternalUserAuthenticationRequest extends ApplicationAdapter {

  urlForCreateRecord() {
    return `${this.host}/${this.namespace}/token-from-external-user`;
  }
}
