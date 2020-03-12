import NotificationsService from 'ember-cli-notifications/services/notifications';
import config from 'pix-orga/config/environment';

const defaultAutoClear = config['ember-cli-notifications'].autoClear;

export default class Notifications extends NotificationsService {

  sendError() {
    return this.error(...arguments, { autoClear: false, cssClasses: 'notification notification--error' });
  }

  sendWarning() {
    return this.warning(...arguments, { autoClear: false, cssClasses: 'notification notification--warning' });
  }

  sendSuccess() {
    return this.success(...arguments, { autoClear: defaultAutoClear, cssClasses: 'notification notification--success' });
  }
}
