import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { CONNECTION_TYPES } from '../../helpers/connection-types';

export default class LearnerHeaderInfo extends Component {
  @service intl;

  get connectionMethods() {
    if (this.args.authenticationMethods) {
      return this.args.authenticationMethods.map((element) => this.intl.t(CONNECTION_TYPES[element])).join(', ');
    }
    return null;
  }
}
