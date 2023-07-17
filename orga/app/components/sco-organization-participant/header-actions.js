import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class ScoHeaderActions extends Component {
  @service currentUser;
  @service session;
  @service intl;

  get acceptedFileType() {
    if (this.currentUser.isAgriculture) {
      return ['.csv'];
    }
    return ['.xml', '.zip'];
  }

  get importButtonLabel() {
    const types = this.acceptedFileType.join(
      this.intl.t('pages.sco-organization-participants.actions.import-file.file-type-separator'),
    );
    return this.intl.t('pages.sco-organization-participants.actions.import-file.label', { types });
  }
}
