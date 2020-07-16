import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import ENV from 'pix-orga/config/environment';

export default class ListItems extends Component {
  @service currentUser;
  @service session;

  @computed('currentUser.organization.id')
  get urlToDownloadCsvTemplate() {
    return `${ENV.APP.API_HOST}/api/organizations/${this.currentUser.organization.id}/schooling-registrations/csv-template?accessToken=${this.session.data.authenticated.access_token}`;
  }
}
