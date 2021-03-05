import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import get from 'lodash/get';

export default class SessionToBePublishedController extends Controller {
  @service notifications;

  @action
  async publishSession(toBePublishedSession) {
    try {
      await toBePublishedSession.publish();
    } catch (err) {
      const finalErr = get(err, 'errors[0].detail', err);
      this.notifications.error(finalErr);
    }
  }
}
