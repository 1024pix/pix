import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class UserCertificationsDetailHeader extends Component {
  @service intl;
  get birthdate() {
    return this.intl.formatDate(this.args.certification.birthdate, { format: 'LL' });
  }
}
