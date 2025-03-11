import Service, { inject as service } from '@ember/service';
import ENV from 'pix-certif/config/environment';

export default class ServerSentEventService extends Service {
  @service store;

  registerSupervisingEvent(model) {
    const evtSource = new EventSource(`${ENV.APP.API_HOST}/api/sessions/7404/supervision-events`, {
      withCredentials: true,
    });

    evtSource.onopen = (event) => console.log('STARTING EVENT SOURCE');
    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      //const modelClass = this.store.modelFor('session-for-supervising');
      //const serializer = this.store.serializerFor('session-for-supervising');
      //const normalized = serializer.normalizeSingleResponse(this.store, modelClass, data);
      //const normalized = this.store.normalize('session-for-supervising', data);
      //const myModel = this.store.push(data);
      //console.dir(normalized);
      //console.dir(normalized.id);

      this.store.pushPayload('session-for-supervising', data);

      //model.set('accessCode', 'POUET');
      // model.setProperties({
      //   accessCode: normalized.accessCode,
      // });
    };
  }
}
