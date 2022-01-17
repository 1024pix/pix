import Route from '@ember/routing/route';
import ENV from 'pix-certif/config/environment';

export default class SessionSupervisingRoute extends Route {
  model(params) {
    const sessionForSupervising = this.store.queryRecord('session-for-supervising', { sessionId: params.session_id });

    this.poller = setInterval(() => {
      this.store.queryRecord('session-for-supervising', { sessionId: params.session_id });
    }, ENV.APP.sessionSupervisingPollingRate);

    return sessionForSupervising;
  }

  deactivate() {
    if (this.poller) {
      clearInterval(this.poller);
    }
  }
}
