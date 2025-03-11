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

  async model(params) {
    const model = this.store.createRecord('session-for-supervising', {
      id: params.session_id,
    });
    //console.dir(model);
    //this.serverSentEvent.registerSupervisingEvent(model);

    return model;

    // return this.store.peekRecord('session-for-supervising', {
    //   sessionId: params.session_id,
    // });
    // this.serverSentEvent.registerSupervisingEvent(result);
    // console.log(result);

    // return result;
  }

  afterModel(model) {
    this.serverSentEvent.registerSupervisingEvent(model);
    // evtSource.onmessage = (event) => {
    //   console.log('RECEIVED UPDATES');
    //   console.log('RECEIVED UPDATES');
    //   const data = JSON.parse(event.data);
    //   console.log(data.included);
    //   console.log('RECEIVED UPDATES');
    //   for (const candidate of data.included) {
    // const modelCandidate =  this.store.findRecord('certification-candidate-for-supervising', candidate.id);
    // console.log(modelCandidate);
    // modelCandidate.setProperties(modelCandidate);
    // }
    // model.certificationCandidates.push(data.included);
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
