import Service, { inject as service } from '@ember/service';
import ENV from 'pix-certif/config/environment';

export default class ServerSentEventService extends Service {
  @service store;
  @service session;

  async registerSupervisingEvent(sessionId) {
    // TODO : handle reject, authentication (pre handler in back), and errors
    //        in certif/app/routes/session-supervising.js afterModel function

    const { promise, resolve, reject } = Promise.withResolvers();

    // Init connection
    const isFirstPayload = true;

    const response = await fetch(`${ENV.APP.API_HOST}/api/sessions/${sessionId}/supervision-events`, {
      headers: {
        Authorization: this.session.data.authenticated.access_token,
      },
    });

    const reader = response?.body?.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const stringDecodedData = new TextDecoder('utf-8').decode(value);
      console.log(stringDecodedData);
    }

    // Pas possible car ne permet pas de prendre en compte le header Authorization.
    /* const evtSource = new EventSource(`${ENV.APP.API_HOST}/api/sessions/${sessionId}/supervision-events`, {
      withCredentials: true,
    }); */

    // TODO : use "on open" to trigger a Loader in service's caller
    // evtSource.onopen = (event) => console.log('STARTING EVENT SOURCE');

    // Listening
    // evtSource.onmessage = (event) => {
    //const data = JSON.parse(event.data);

    //const modelClass = this.store.modelFor('session-for-supervising');
    //const serializer = this.store.serializerFor('session-for-supervising');
    //const normalized = serializer.normalizeSingleResponse(this.store, modelClass, data);
    //const normalized = this.store.normalize('session-for-supervising', data);
    //const myModel = this.store.push(data);
    //console.dir(normalized);
    //console.dir(normalized.id);

    // TODO : pushPayload is from LEGACY Ember package
    //        we should use this.store.push() but it requires normalization prior to push
    //   this.store.pushPayload('session-for-supervising', data);
    //   if (isFirstPayload) {
    //     isFirstPayload = false;
    //     resolve(this.store.peekRecord('session-for-supervising', sessionId));
    //   }
    // };
    //
    // return promise;
  }
}
