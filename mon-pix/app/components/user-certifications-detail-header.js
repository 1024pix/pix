import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class UserCertificationsDetailHeader extends Component {
  @service intl;

  @tracked tooltipText = 'Copier le code';

  get birthdate() {
    return this.intl.formatDate(this.args.certification.birthdate, { format: 'LL' });
  }

  @action
  clipboardSuccess() {
    this.tooltipText = 'Code copié !';
  }
}
