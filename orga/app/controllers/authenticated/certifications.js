import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AuthenticatedCertificationsController extends Controller {
  @service fileSaver;
  @service session;
  @service currentUser;
  @service notifications;

  @tracked selectedDivision = this.model.options[0].value ;

  @action
  onSelectDivision(event) {
    this.selectedDivision = event.target.value;
  }

  @action
  async downloadSessionResultFile() {

    const organizationId = this.currentUser.organization.id;

    try {
      const url = `/api/organizations/${organizationId}/certification-results?division=${this.selectedDivision}`;

      let token = '';

      if (this.session.isAuthenticated) {
        token = this.session.data.authenticated.access_token;
      }

      await this.fileSaver.save({ url, token });
    } catch (error) {
      if (_isErrorNotFound(error)) {
        this.notifications.error('Aucun résultat de certification pour cette classe.');
      }
    }
  }
}

function _isErrorNotFound(error) {
  return error[0] && error[0].status == 404;
}
