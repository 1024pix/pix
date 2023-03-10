import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import get from 'lodash/get';

export default class GetController extends Controller {
  @service notifications;
  @service router;
  @service accessControl;
  @service intl;

  @action
  async updateOrganizationInformation() {
    try {
      await this.model.save();
      this.notifications.success("L'organisation a bien été modifiée.");
    } catch (responseError) {
      this.model.rollbackAttributes();
      const error = get(responseError, 'errors[0]');
      let message;
      switch (error?.status) {
        case '413':
          message = this.intl.t(I18N_KEY_ERROR_MESSAGES[error?.status], {
            maxSizeInMegaBytes: error?.meta?.maxSizeInMegaBytes,
          });
          break;
        default:
          message = this.intl.t(I18N_KEY_ERROR_MESSAGES['default']);
      }
      this.notifications.error(message, { autoClear: false });
    }
  }

  @action
  async archiveOrganization() {
    try {
      await this.model.save({ adapterOptions: { archiveOrganization: true } });

      this.notifications.success('Cette organisation a bien été archivée.');
      this.router.transitionTo('authenticated.organizations.get');
    } catch (responseError) {
      const status = get(responseError, 'errors[0].status');
      if (status === '422') {
        return this.notifications.error("L'organisation n'a pas pu être archivée.");
      }
      this.notifications.error('Une erreur est survenue.');
    }
  }
}

const I18N_KEY_ERROR_MESSAGES = {
  413: 'pages.organizations.notifications.errors.payload-too-large',
  default: 'common.notifications.generic-error',
};
