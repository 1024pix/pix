import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class NewController extends Controller {
  @service pixToast;
  @service router;
  @service intl;
  @service store;

  queryParams = ['parentOrganizationId', 'parentOrganizationName'];

  @tracked parentOrganizationId = null;
  @tracked parentOrganizationName = null;

  @action
  goBackToOrganizationList() {
    this.router.transitionTo('authenticated.organizations');
  }

  @action
  async addOrganization() {
    if (this.parentOrganizationId) {
      this.model.organization.setProperties({
        parentOrganizationId: this.parentOrganizationId,
      });
    }

    try {
      await this.model.organization.save();
      this.pixToast.sendSuccessNotification({ message: 'L’organisation a été créée avec succès.' });

      if (this.model.organization.parentOrganizationId) {
        const parentOrganization = await this.store.findRecord(
          'organization',
          this.model.organization.parentOrganizationId,
        );
        await parentOrganization.hasMany('children').reload();
      }

      this.router.transitionTo('authenticated.organizations.get.all-tags', this.model.organization.id);
    } catch {
      this.pixToast.sendErrorNotification({ message: 'Une erreur est survenue.' });
    }
  }
}
