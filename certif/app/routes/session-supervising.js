import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { service } from '@ember/service';

/**
 * TODO remaining :
 *  * quit button does not seem to fire deactivate error
 *  * test what happens if backend restart (please try that on RA not with local server)
 */

export default class SessionSupervisingRoute extends Route {
  @service store;
  @service router;
  @service pixToast;
  @service intl;
  @service serverSentEvent;

  async beforeModel(transition) {
    const params = transition.to.params;
    return this.serverSentEvent.connect(params.session_id);
  }

  async model(params) {
    // Init the ember model that will be filled with server events
    const model = this.store.push({
      data: {
        type: 'session-for-supervising',
        id: params.session_id,
      },
    });

    this.serverSentEvent.registerOnModelUpdateHandler(async (event) => {
      this.store.pushPayload('session-for-supervising', event.value);
    });

    this.serverSentEvent.registerOnErrorHandler((error) => {
      console.warn(error);
      this.pixToast.sendErrorNotification({
        message: this.intl.t('pages.session-supervising-error.no-internet-error'),
      });
    });

    this.serverSentEvent.startListening();

    return model;
  }

  deactivate() {
    this.serverSentEvent.stopListening();
  }

  @action
  error() {
    this.serverSentEvent.stopListening();
    return true;
  }
}
