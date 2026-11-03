import Service, { service } from '@ember/service';
import { cancelPoll, pollTask, runTask } from 'ember-lifeline';
import ENV from 'mon-pix/config/environment';

export default class BannerPollingService extends Service {
  @service store;

  #pollingStopped = true;
  #poller = null;

  async start() {
    console.log('start polling');
    if (!this.#pollingStopped) return;
    this.#pollingStopped = false;

    this.#poller = pollTask(this, async (next) => {
      if (this.#pollingStopped) return;
      console.count('poll');
      try {
        await this.store
          .findRecord('information-banner', `${ENV.APP.APPLICATION_NAME}`, { reload: true })
          .finally(() => runTask(this, next, ENV.APP.INFORMATION_BANNER_POLLING_TIME));
      } catch (err) {
        this.stop();
      }
    });
  }

  stop() {
    console.log('stop polling');
    cancelPoll(this, this.#poller);
    this.#pollingStopped = true;
  }
}
