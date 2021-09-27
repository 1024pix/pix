import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'pix-orga/config/environment';

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
    const types = this.acceptedFileType.join(this.intl.t('pages.students-sco.actions.import-file.file-type-separator'));
    return this.intl.t('pages.students-sco.actions.import-file.label', { types });
  }

  get urlToDownloadCsvTemplate() {
    return `${ENV.APP.API_HOST}/api/organizations/${this.currentUser.organization.id}/schooling-registrations/csv-template?accessToken=${this.session.data.authenticated.access_token}&lang=${this.currentUser.prescriber.lang}`;
  }
}
