import Service, { inject as service } from '@ember/service';
import ENV from 'pix-certif/config/environment';

export default class ServerSentEventService extends Service {
  @service store;

  registerSupervisingEvent(model) {
    const evtSource = new EventSource(`${ENV.APP.API_HOST}/api/sessions/7409/supervision-events`, {
      withCredentials: true,
    });

    evtSource.onopen = (event) => console.log('STARTING EVENT SOURCE');
    evtSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      this.store.push(data);
    };
  }
}
