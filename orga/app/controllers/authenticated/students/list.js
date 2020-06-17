import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { debounce } from '@ember/runloop';
import Controller from '@ember/controller';
import { htmlSafe } from '@ember/template';
import ENV from 'pix-orga/config/environment';

export default class ListController extends Controller {
  @service session;
  @service currentUser;
  @service notifications;

  isLoading = false;

  filters = {};

  updateFilters() {
    this.setProperties(this.filters);
  }

  @action
  triggerFiltering(fieldName, event) {
    const value = event.target.value;
    this.filters[fieldName] = value;
    debounce(this, this.updateFilters, ENV.pagination.debounce);
  }

  @action
  async importStudents(file) {
    this.set('isLoading', true);
    this.get('notifications').clearAll();
    const { access_token } = this.get('session.data.authenticated');

    try {
      await file.uploadBinary(`${ENV.APP.API_HOST}/api/organizations/${this.get('currentUser.organization.id')}/import-students`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        }
      });
      this.send('refreshModel');
      this.set('isLoading', false);
      this.get('notifications').sendSuccess('La liste a été importée avec succès.');

    } catch (errorResponse) {
      this.set('isLoading', false);
      
      this.handleError(errorResponse);
    }
  }

  handleError(errorResponse) {
    const globalErrorMessage = 'Quelque chose s\'est mal passé. Veuillez réessayer.';
    if (!errorResponse.body.errors) {
      return this.get('notifications').sendError(globalErrorMessage);
    }

    errorResponse.body.errors.forEach((error) => {
      if (error.status === '409' || error.status === '422') {
        return this.get('notifications').sendError(error.detail);
      }
      if (error.status === '400') {
        const errorDetail = htmlSafe(`<div>${error.detail} Veuillez réessayer ou nous contacter via <a id="support-link" href="https://support.pix.fr/support/tickets/new">le formulaire du centre d'aide</a>.</div>`);
        return this.get('notifications').error(errorDetail, { autoClear: false, cssClasses: 'notification notification--error', onClick: function() { window.open('https://support.pix.fr/support/tickets/new', '_blank'); } });
      }
      return this.get('notifications').sendError(globalErrorMessage);
    });
  }
}
