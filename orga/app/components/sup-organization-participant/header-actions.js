import { service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'pix-orga/config/environment';

export default class SupHeaderActions extends Component {
  @service currentUser;
  @service intl;
  @service session;

  get urlToDownloadCsvTemplate() {
    return `${ENV.APP.API_HOST}/api/organizations/${this.currentUser.organization.id}/organization-learners/csv-template?accessToken=${this.session.data.authenticated.access_token}&lang=${this.intl.primaryLocale}`;
  }
}
