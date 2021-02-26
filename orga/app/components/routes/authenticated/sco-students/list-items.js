import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-orga/config/environment';

export default class ListItems extends Component {

  @service currentUser;
  @service session;
  @service store;
  @service router;
  @service notifications;
  @service intl;

  @tracked student = null;
  @tracked isShowingAuthenticationMethodModal = false;
  @tracked isShowingDissociateModal = false;
  @tracked isDissociateButtonEnabled = ENV.APP.IS_DISSOCIATE_BUTTON_ENABLED;

  get acceptedFileType() {
    if (this.currentUser.isAgriculture) {
      return ['.csv'];
    }
    return ['.xml', '.zip'];
  }

  get importButtonLabel() {
    const types = this.acceptedFileType.join(this.intl.t('pages.students-sco.actions.import-file.file-type-separator'));
    return this.intl.t('pages.students-sco.actions.import-file.label', { types });
  }

  get displayLearnMoreAndLinkTemplate() {
    return this.currentUser.isAgriculture && this.currentUser.isCFA;
  }

  get urlToDownloadCsvTemplate() {
    return `${ENV.APP.API_HOST}/api/organizations/${this.currentUser.organization.id}/schooling-registrations/csv-template?accessToken=${this.session.data.authenticated.access_token}`;
  }

  @action
  openAuthenticationMethodModal(student) {
    this.student = student;
    this.isShowingAuthenticationMethodModal = true;
  }

  @action
  closeAuthenticationMethodModal() {
    this.isShowingAuthenticationMethodModal = false;
  }

  @action
  openDissociateModal(student) {
    this.student = student;
    this.isShowingDissociateModal = true;
  }

  @action
  closeDissociateModal() {
    this.isShowingDissociateModal = false;
  }
}
