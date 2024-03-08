import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class OrganizationsImport extends Component {
  @service intl;
  @service notifications;
  @service router;
  @service store;

  @action
  async importOrganizations(files) {
    this.notifications.clearAll();

    const adapter = this.store.adapterFor('organizations-import');
    try {
      await adapter.addOrganizationsCsv(files);
      this.notifications.success(this.intl.t('components.administration.organizations-import.notifications.success'));
    } catch (errorResponse) {
      const errors = errorResponse.errors;

      if (!errors) {
        return this.notifications.error(this.intl.t('common.notifications.generic-error'));
      }
      errors.forEach((error) => {
        switch (error.code) {
          case 'MISSING_REQUIRED_FIELD_NAMES':
            this.notifications.error(`${error.meta}`, { autoClear: false });
            break;
          default:
            this.notifications.error(error.detail, { autoClear: false });
        }
      });
    } finally {
      this.isLoading = false;
    }
  }
}
