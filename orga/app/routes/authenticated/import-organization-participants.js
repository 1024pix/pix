import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ImportOrganizationParticipantsRoute extends Route {
  @service currentUser;
  @service router;
  @service store;

  beforeModel() {
    super.beforeModel(...arguments);

    if (!this.currentUser.canAccessImportPage) {
      return this.router.replaceWith('application');
    }
  }

  async model() {
    try {
      return await this.store.queryRecord('organization-import-detail', {
        organizationId: this.currentUser.organization.id,
      });
    } catch (error) {
      this.router.replaceWith('application');
    }
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      ['errors', 'warnings', 'warningBanner'].forEach((args) => controller.set(args, null));
    }
  }

  @action
  async refreshDivisions() {
    await this.currentUser.organization.hasMany('divisions').reload();
  }

  @action
  async refreshGroups() {
    await this.currentUser.organization.hasMany('groups').reload();
  }
  @action
  refreshModel() {
    this.refresh();
  }
}
