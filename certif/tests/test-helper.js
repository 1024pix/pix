import Application from 'pix-certif/app';
import config from 'pix-certif/config/environment';
import { setApplication } from '@ember/test-helpers';
import start from 'ember-exam/test-support/start';

import NotificationMessageService from 'ember-cli-notifications/services/notifications';

NotificationMessageService.reopen({
  removeNotification(notification) {
    if (!notification) {
      return;
    }

    notification.set('dismiss', true);
    this.content.removeObject(notification);
  },
});

setApplication(Application.create(config.APP));

start();
