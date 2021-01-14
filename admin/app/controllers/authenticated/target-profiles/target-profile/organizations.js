import uniq from 'lodash/uniq';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import debounce from 'lodash/debounce';
import config from 'pix-admin/config/environment';

const DEFAULT_PAGE_NUMBER = 1;

export default class TargetProfileOrganizationsController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'id', 'name', 'type', 'externalId'];
  DEBOUNCE_MS = config.pagination.debounce;

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 10;
  @tracked id = null;
  @tracked name = null;
  @tracked type = null;
  @tracked externalId = null;
  @tracked organizationsToAttach = [];

  @service notifications;

  updateFilters(filters) {
    Object.keys(filters).forEach((filterKey) => this[filterKey] = filters[filterKey]);
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  debouncedUpdateFilters = debounce(this.updateFilters, this.DEBOUNCE_MS);

  @action
  triggerFiltering(fieldName, event) {
    this.debouncedUpdateFilters({ [fieldName]: event.target.value });
  }

  @action
  goToOrganizationPage(organizationId) {
    this.transitionToRoute('authenticated.organizations.get', organizationId);
  }

  @action
  async attachOrganizations() {
    const targetProfile = this.model.targetProfile;
    try {
      await targetProfile.attachOrganizations({ 'organization-ids': this._getUniqueOrganizations() });
      this.organizationsToAttach = null;
      this.send('refreshModel');
      return this.notifications.success('Organisation(s) rattaché(es) avec succès.');
    } catch (responseError) {
      this._handleResponseError(responseError);
    }
  }

  _handleResponseError({ errors }) {
    if (!errors) {
      return this.notifications.error('Une erreur est survenue.');
    }
    errors.forEach((error) => {
      if (['404', '412'].includes(error.status)) {
        this.notifications.error(error.detail);
      }
      if (error.status === '400') {
        this.notifications.error('Une erreur est survenue.');
      }
    });
  }

  _getUniqueOrganizations() {
    const targetProfileIds = this.organizationsToAttach.split(',').map((targetProfileId) => parseInt(targetProfileId.trim()));
    return uniq(targetProfileIds);
  }
}
