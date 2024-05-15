import NotificationMessageService from '@1024pix/ember-cli-notifications/services/notifications';
import { setApplication } from '@ember/test-helpers';
import start from 'ember-exam/test-support/start';
import * as QUnit from 'qunit';
import { setup } from 'qunit-dom';

import Application from '../app';
import config from '../config/environment';

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
setup(QUnit.assert);
start();
