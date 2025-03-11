import Service, { inject as service } from '@ember/service';
import ENV from 'pix-certif/config/environment';

export default class ServerSentEventService extends Service {
  @service store;

  async registerSupervisingEvent(sessionId) {
    // TODO : handle reject, authentication (pre handler in back), and errors
    //        in certif/app/routes/session-supervising.js afterModel function


    const { promise, resolve, reject } = Promise.withResolvers();

    // Init connection
    let isFirstPayload = true;
    const evtSource = new EventSource(`${ENV.APP.API_HOST}/api/sessions/${sessionId}/supervision-events`, {
      withCredentials: true,
    });

    // TODO : use "on open" to trigger a Loader in service's caller
    evtSource.onopen = (event) => console.log('STARTING EVENT SOURCE');

    // Listening
    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      //const modelClass = this.store.modelFor('session-for-supervising');
      //const serializer = this.store.serializerFor('session-for-supervising');
      //const normalized = serializer.normalizeSingleResponse(this.store, modelClass, data);
      //const normalized = this.store.normalize('session-for-supervising', data);
      //const myModel = this.store.push(data);
      //console.dir(normalized);
      //console.dir(normalized.id);

      // TODO : pushPayload is from LEGACY Ember package
      //        we should use this.store.push() but it requires normalization prior to push
      this.store.pushPayload('session-for-supervising', data);
      if (isFirstPayload) {
        isFirstPayload = false;
        resolve(this.store.peekRecord('session-for-supervising', sessionId));
      }
    };

    return promise;
  }
}
