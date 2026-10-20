import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { debounceTask } from 'ember-lifeline';
import config from 'pix-admin/config/environment';

const DEFAULT_PAGE_NUMBER = 1;

export default class CombinedCourseBlueprintOrganizationsController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'id', 'name', 'type', 'externalId', 'administrationTeamId', 'hideArchived'];
  DEBOUNCE_MS = config.pagination.debounce;
  @service router;
  @service pixToast;
  @service store;
  @service intl;

  @tracked pageNumber = DEFAULT_PAGE_NUMBER;
  @tracked pageSize = 10;
  @tracked id = null;
  @tracked hideArchived = false;
  @tracked name = null;
  @tracked type = null;
  @tracked externalId = null;
  @tracked administrationTeamId = null;

  updateFilters(filters) {
    for (const filterKey of Object.keys(filters)) {
      this[filterKey] = filters[filterKey];
    }
    this.pageNumber = DEFAULT_PAGE_NUMBER;
  }

  @action
  triggerFiltering(fieldName, event) {
    debounceTask(this, 'updateFilters', { [fieldName]: event.target.value }, this.DEBOUNCE_MS);
  }

  @action
  goToOrganizationPage(organizationId) {
    this.router.transitionTo('authenticated.organizations.get', organizationId);
  }

  @action
  async detachOrganization(organizationId) {
    const adapter = this.store.adapterFor('combined-course-blueprint');
    const organization = await this.store.findRecord('organization', organizationId);

    try {
      await adapter.detachOrganizations(this.model.blueprint.id, [organizationId]);

      await this.pixToast.sendSuccessNotification({
        message: this.intl.t('components.combined-course-blueprints.organizations.detach-organization-success', {
          name: organization.name,
        }),
      });
      this.router.transitionTo('authenticated.combined-course-blueprints.combined-course-blueprint.organizations');
    } catch {
      return this.pixToast.sendErrorNotification({ message: this.intl.t('common.notifications.generic-error') });
    }
  }

  @action
  onResetFilter() {
    this.id = null;
    this.name = null;
    this.type = null;
    this.externalId = null;
    this.hideArchived = false;
    this.administrationTeamId = null;
  }
}
