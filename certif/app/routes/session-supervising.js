import Route from '@ember/routing/route';
import ENV from 'pix-certif/config/environment';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class SessionSupervisingRoute extends Route {
  @service store;

  async model(params) {
    return this.store.queryRecord('session-for-supervising', {
      sessionId: params.session_id,
    });
  }

  afterModel(model) {
    this.poller = setInterval(async () => {
      await this.store.queryRecord('session-for-supervising', { sessionId: model.id });
    }, ENV.APP.sessionSupervisingPollingRate);
  }

  deactivate() {
    if (this.poller) {
      clearInterval(this.poller);
    }
  }

  @action
  error() {
    if (this.poller) {
      clearInterval(this.poller);
    }
    return true;
  }
}
