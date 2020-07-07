import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-orga/config/environment';
import { CONNEXION_TYPES } from '../../../models/student';
import debounce from 'lodash/debounce';

export default class ListController extends Controller {
  @service session;
  @service currentUser;
  @service notifications;

  isLoading = false;

  @tracked lastName = null;
  @tracked firstName = null;
  @tracked connexionType = null;
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

  get connexionTypesOptions() {
    return [
      { value: '', label: 'Tous' },
      { value: 'none', label: CONNEXION_TYPES.none },
      { value: 'email', label: CONNEXION_TYPES.email },
      { value: 'identifiant', label: CONNEXION_TYPES.identifiant },
      { value: 'mediacentre', label: CONNEXION_TYPES.mediacentre },
    ];
  }
}
