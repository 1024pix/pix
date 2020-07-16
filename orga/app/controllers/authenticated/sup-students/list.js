import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-orga/config/environment';
import debounce from 'lodash/debounce';

export default class ListController extends Controller {
  @service session;
  @service currentUser;
  @service notifications;

  isLoading = false;

  @tracked lastName = null;
  @tracked firstName = null;
  @tracked pageNumber = null;
  @tracked pageSize = null;

  updateFilters(filters) {
    this.setProperties(filters);
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

  @action
  async importStudents(file) {
    this.set('isLoading', true);
    this.get('notifications').clearAll();
    const { access_token } = this.get('session.data.authenticated');

    try {
      await file.uploadBinary(`${ENV.APP.API_HOST}/api/organizations/${this.get('currentUser.organization.id')}/schooling-registrations/import-csv`, {
        headers: {
          Authorization: `Bearer ${access_token}`,
        }
      });

      this.refresh();
      this.set('isLoading', false);
      this.get('notifications').sendSuccess('La liste a été importée avec succès.');

    } catch (errorResponse) {
      this.set('isLoading', false);

      this.get('notifications').sendError('Quelque chose s\'est mal passé. Veuillez réessayer.');

    }
  }

  refresh() {
    this.send('refreshModel');
  }
}
