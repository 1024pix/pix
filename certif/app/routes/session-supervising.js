import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import ENV from 'pix-certif/config/environment';

const NO_INTERNET_MESSAGE = 'Failed to fetch';
export default class SessionSupervisingRoute extends Route {
  @service store;
  @service router;
  @service pixToast;
  @service intl;
  @service serverSentEvent;

  split = (input) => {
    let rgx = /[:]\s*/;
    let match = rgx.exec(input);
    // ": comment" -> index=0 -> ignore
    let idx = match && match.index;
    if (idx) {
      return [
        input.substring(0, idx),
        input.substring(idx + match[0].length),
      ];
    }
  }

  // source d'inspi:  https://github.com/lukeed/fetch-event-stream/blob/main/mod.ts
  // source d'inspi:  https://developer.mozilla.org/en-US/docs/Web/API/TextDecoderStream#examples
  // source d'inspi:  https://yama-corp.com/fr/developpement/2024-08-02/les-server-sent-events-sse/
  myHandler = async (response) => {

    console.log('COUCOU');
    console.log(typeof response);

    const reader = response?.body?.getReader();
    // while (true) {
      const { done, value } = await reader.read();
      // if (done) break;


      const raw = new TextDecoder('utf-8').decode(value);
      const [event, data] = this.split(raw);
      console.log(raw);
      const decoded = JSON.parse(data);
      this.store.pushPayload('session-for-supervising', decoded);
    // }
  }

  async model(params) {

  return this.serverSentEvent.registerSupervisingEvent(params.session_id, this.myHandler);
  }

  afterModel(model) {
    // this.poller = setInterval(async () => {
    //   try {
    //     await this.store.queryRecord('session-for-supervising', { sessionId: model.id });
    //   } catch (response) {
    //     this.#stopPolling();
    //     if (response?.errors?.[0]?.status === '401') {
    //       this.router.replaceWith('login-session-supervisor');
    //     }
    //     if (response.message === NO_INTERNET_MESSAGE) {
    //       this.pixToast.sendErrorNotification({
    //         message: this.intl.t('pages.session-supervising-error.no-internet-error'),
    //       });
    //     }
    //   }
    // }, ENV.APP.sessionSupervisingPollingRate);
  }

  deactivate() {
    this.#stopPolling();
  }

  @action
  error() {
    this.#stopPolling();
    return true;
  }

  #stopPolling() {
    if (this.poller) {
      clearInterval(this.poller);
      this.poller = null;
    }
  }
}
