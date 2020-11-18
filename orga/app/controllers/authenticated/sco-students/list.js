import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-orga/config/environment';
import { CONNEXION_TYPES } from '../../../models/student';
import debounce from 'lodash/debounce';

export default class ListController extends Controller {
  @service session;
  @service currentUser;
  @service notifications;

  @tracked isLoading = false;

  @tracked lastName = null;
  @tracked firstName = null;
  @tracked connexionType = null;
  @tracked pageNumber = null;
  @tracked pageSize = null;

  updateFilters(filters) {
    Object.keys(filters).forEach((filterKey) => this[filterKey] = filters[filterKey]);
    this.pageNumber = null;
  }

  debouncedUpdateFilters = debounce(this.updateFilters, ENV.pagination.debounce);

  @action
  triggerFiltering(fieldName, debounced, event) {
    if (debounced) {
      this.debouncedUpdateFilters({ [fieldName]: event.target.value });
    } else {
      this.updateFilters({ [fieldName]: event.target.value });
    }
  }

  get connexionTypesOptions() {
    return [
      { value: 'none', label: CONNEXION_TYPES.none },
      { value: 'email', label: CONNEXION_TYPES.email },
      { value: 'identifiant', label: CONNEXION_TYPES.identifiant },
      { value: 'mediacentre', label: CONNEXION_TYPES.mediacentre },
    ];
  }

  @action
  async importStudents(file) {
    this.isLoading = true;
    this.notifications.clearAll();
    const { access_token } = this.session.data.authenticated;
    const format = this.currentUser.isAgriculture ? 'csv' : 'xml';
    try {
      await file.uploadBinary(`${ENV.APP.API_HOST}/api/organizations/${this.currentUser.organization.id}/schooling-registrations/import-siecle?format=${format}`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      this.refresh();
      this.isLoading = false;
      this.notifications.sendSuccess('La liste a été importée avec succès.');

    } catch (errorResponse) {
      this.isLoading = false;

      this._handleError(errorResponse);
    }
  }

  _handleError(errorResponse) {
    const globalErrorMessage = 'Quelque chose s\'est mal passé. Veuillez réessayer.';
    if (!errorResponse.body.errors) {
      return this.notifications.sendError(globalErrorMessage);
    }

    errorResponse.body.errors.forEach((error) => {
      if (error.status === '409' || error.status === '422' || error.status === '412') {
        return this.notifications.sendError(error.detail);
      }
      if (error.status === '400') {
        const errorDetail = htmlSafe(`<div>${error.detail} Veuillez réessayer ou nous contacter via <a id="support-link" href="https://support.pix.fr/support/tickets/new">le formulaire du centre d'aide</a>.</div>`);
        return this.notifications.error(errorDetail, { autoClear: false, cssClasses: 'notification notification--error', onClick: function() { window.open('https://support.pix.fr/support/tickets/new', '_blank'); } });
      }
      return this.notifications.sendError(globalErrorMessage);
    });
  }

  @action
  refresh() {
    this.send('refreshModel');
  }
}
