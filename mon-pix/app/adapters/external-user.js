import classic from 'ember-classic-decorator';
import ApplicationAdapter from './application';

@classic
export default class ExternalUser extends ApplicationAdapter {

  urlForCreateRecord() {
    return `${this.host}/${this.namespace}/schooling-registration-dependent-users/external-user-token`;
  }

}
