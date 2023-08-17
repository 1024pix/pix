import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import debounce from 'lodash/debounce';
import config from 'pix-admin/config/environment';

const DEFAULT_PAGE_NUMBER = 1;

export default class TargetProfileOrganizationsController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'id', 'name', 'type', 'externalId'];
  DEBOUNCE_MS = config.pagination.debounce;
  @service router;
  @service notifications;
  @service store;

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 10;
  @tracked id = null;
  @tracked name = null;
  @tracked type = null;
  @tracked externalId = null;

  updateFilters(filters) {
    Object.keys(filters).forEach((filterKey) => (this[filterKey] = filters[filterKey]));
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  debouncedUpdateFilters = debounce(this.updateFilters, this.DEBOUNCE_MS);

  @action
  triggerFiltering(fieldName, event) {
    this.debouncedUpdateFilters({ [fieldName]: event.target.value });
  }

  @action
  goToOrganizationPage(organizationId) {
    this.router.transitionTo('authenticated.organizations.get', organizationId);
  }

  @action
  async detachOrganizations(organizationId) {
    const adapter = this.store.adapterFor('target-profile');

    try {
      const detachedOrganizationIds = await adapter.detachOrganizations(this.model.targetProfile.id, [organizationId]);
      const hasDetachedOrganizations = detachedOrganizationIds.length > 0;

      if (hasDetachedOrganizations) {
        const message = 'Organisation(s) détachée(s) avec succès : ' + detachedOrganizationIds.join(', ');
        await this.notifications.success(message, { htmlContent: true });
        this.router.transitionTo('authenticated.target-profiles.target-profile.organizations');
      }
    } catch (responseError) {
      return this.notifications.error('Une erreur est survenue.');
    }
  }
}
